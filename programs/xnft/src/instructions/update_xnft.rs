// Copyright (C) 2023 Blue Coral, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

use anchor_lang::prelude::*;
use anchor_spl::metadata::{self, Metadata, MetadataAccount, UpdateMetadataAccountsV2};
use anchor_spl::token::TokenAccount;
use mpl_token_metadata::state::DataV2;

use crate::events::XnftUpdated;
use crate::state::{CuratorStatus, Kind, UpdateParams, Xnft};
use crate::CustomError;

#[derive(Accounts)]
pub struct UpdateXnft<'info> {
    #[account(
        mut,
        has_one = master_metadata,
    )]
    pub xnft: Account<'info, Xnft>,

    #[account(
        constraint = master_token.mint == xnft.master_mint,
        constraint = master_token.amount == 1,
    )]
    pub master_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = master_metadata.is_mutable @ CustomError::MetadataIsImmutable,
    )]
    pub master_metadata: Account<'info, MetadataAccount>,

    /// CHECK: is validated in the associated token constraint on `master_token`.
    pub curation_authority: UncheckedAccount<'info>,
    pub updater: Signer<'info>, // TODO: reverse to enable curation

    pub metadata_program: Program<'info, Metadata>,
}

impl<'info> UpdateXnft<'info> {
    pub fn update_metadata_accounts_ctx(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, UpdateMetadataAccountsV2<'info>> {
        let program = self.metadata_program.to_account_info();
        let accounts = UpdateMetadataAccountsV2 {
            metadata: self.master_metadata.to_account_info(),
            update_authority: self.xnft.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}

pub fn update_xnft_handler(ctx: Context<UpdateXnft>, updates: UpdateParams) -> Result<()> {
    let clock = Clock::get()?;
    let md = &ctx.accounts.master_metadata;

    // Validate the owner or update authority of the xNFT metadata.
    match ctx.accounts.xnft.kind {
        Kind::App => {
            require_keys_eq!(
                ctx.accounts.master_token.owner,
                *ctx.accounts.updater.key,
                CustomError::UpdateAuthorityMismatch,
            );
        }
        Kind::Collectible => {
            require_keys_eq!(
                md.update_authority,
                *ctx.accounts.updater.key,
                CustomError::UpdateAuthorityMismatch,
            );
        }
    }

    // Gates the processing of an xNFT update if there is a set curator update authority
    // on the account that does not match the signer of the transaction.
    if let Some(CuratorStatus {
        pubkey,
        verified: true,
    }) = ctx.accounts.xnft.curator
    {
        require_keys_eq!(
            pubkey,
            *ctx.accounts.curation_authority.key,
            CustomError::CuratorAuthorityMismatch,
        );
    }

    // Handle update propagation to the Metaplex metadata account is the
    // optional update parameters includes new values for the name or uri.
    if updates.uri.is_some() || updates.name.is_some() {
        let xnft = &mut ctx.accounts.xnft;
        let uri = updates.uri.unwrap_or_else(|| xnft.uri.clone());
        xnft.uri = uri.clone();

        if xnft.kind == Kind::App {
            metadata::update_metadata_accounts_v2(
                ctx.accounts
                    .update_metadata_accounts_ctx()
                    .with_signer(&[&ctx.accounts.xnft.as_seeds()]),
                None,
                Some(DataV2 {
                    name: updates.name.unwrap_or_else(|| md.data.name.clone()),
                    symbol: md.data.symbol.clone(),
                    uri,
                    seller_fee_basis_points: md.data.seller_fee_basis_points,
                    creators: md.data.creators.clone(),
                    collection: md.collection.clone(),
                    uses: md.uses.clone(),
                }),
                None,
                None,
            )?;
        }
    }

    let xnft = &mut ctx.accounts.xnft;
    xnft.install_authority = updates.install_authority;

    // Set other xNFT program account data fields if alternatives
    // were provided in the optional update parameters.
    if let Some(price) = updates.install_price {
        xnft.install_price = price;
    }

    if let Some(vault) = updates.install_vault {
        xnft.install_vault = vault;
    }

    if let Some(tag) = updates.tag {
        xnft.tag = tag;
    }

    // Only update the supply if a new supply value was given and
    // its an additive change from the original value. If there was no
    // original supply value, indicating that there's an unlimited supply,
    // ensure that the new supply value proposed is more than the current
    // amount of installations that have been created.
    match updates.supply {
        Some(new_supply) => {
            if (xnft.supply.is_none() && xnft.total_installs > new_supply)
                || (xnft.supply.is_some() && xnft.supply.unwrap() > new_supply)
            {
                return Err(error!(CustomError::SupplyReduction));
            }

            require_gt!(new_supply, 0);
            xnft.supply = Some(new_supply);
        }
        None => {
            xnft.supply = None;
        }
    }

    xnft.updated_ts = clock.unix_timestamp;

    emit!(XnftUpdated { xnft: xnft.key() });

    Ok(())
}
