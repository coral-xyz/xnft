// Copyright (C) 2022 Blue Coral, Inc.
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
use crate::state::{CuratorStatus, Tag, Xnft};
use crate::CustomError;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateParams {
    install_authority: Option<Pubkey>,
    install_price: u64,
    install_vault: Pubkey,
    supply: Option<u64>,
    tag: Tag,
    uri: Option<String>,
}

#[derive(Accounts)]
pub struct UpdateXnft<'info> {
    #[account(
        mut,
        has_one = master_metadata,
    )]
    pub xnft: Account<'info, Xnft>,

    #[account(
        associated_token::mint = xnft.master_mint,
        associated_token::authority = xnft_authority,
        constraint = master_token.amount == 1,
    )]
    pub master_token: Account<'info, TokenAccount>,

    #[account(mut)]
    pub master_metadata: Account<'info, MetadataAccount>,

    /// CHECK: is validated in the associated token constraint on `master_token`.
    pub update_authority: UncheckedAccount<'info>, // TODO: reverse for curator approval enforcement
    pub xnft_authority: Signer<'info>,

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

    // Gates the processing of an xNFT update if there is a set update authority
    // on the account that does not match the signer of the transaction.
    if let Some(CuratorStatus {
        pubkey,
        verified: true,
    }) = ctx.accounts.xnft.curator
    {
        if pubkey != *ctx.accounts.update_authority.key {
            return Err(error!(CustomError::CuratorAuthorityMismatch));
        }
    }

    if let Some(u) = updates.uri.as_ref() {
        metadata::update_metadata_accounts_v2(
            ctx.accounts.update_metadata_accounts_ctx().with_signer(&[&[
                "xnft".as_bytes(),
                ctx.accounts.xnft.master_edition.as_ref(),
                &[ctx.accounts.xnft.bump],
            ]]),
            Some(md.update_authority),
            Some(DataV2 {
                name: ctx.accounts.xnft.name.clone(),
                symbol: md.data.symbol.clone(),
                uri: u.clone(),
                seller_fee_basis_points: md.data.seller_fee_basis_points,
                creators: md.data.creators.clone(),
                collection: md.collection.clone(),
                uses: md.uses.clone(),
            }),
            Some(md.primary_sale_happened),
            Some(md.is_mutable),
        )?;
    }

    let xnft = &mut ctx.accounts.xnft;
    xnft.install_authority = updates.install_authority;
    xnft.install_price = updates.install_price;
    xnft.install_vault = updates.install_vault;
    xnft.tag = updates.tag;

    // Only update the supply if a new supply value was given and
    // its an additive change from the original value. If there was no
    // original supply value, indicating that there's an unlimited supply,
    // ensure that the new supply value proposed is more than the current
    // amount of installations that have been created.
    match updates.supply {
        Some(new_supply) => {
            if (xnft.supply.is_none() && xnft.total_installs > new_supply)
                || xnft.supply.unwrap() > new_supply
            {
                return Err(error!(CustomError::SupplyReduction));
            }
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
