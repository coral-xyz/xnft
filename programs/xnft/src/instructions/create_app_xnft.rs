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
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::{
    self, CreateMetadataAccountsV3, Metadata, SignMetadata, UpdatePrimarySaleHappenedViaToken,
};
use anchor_spl::token::{self, FreezeAccount, Mint, MintTo, Token, TokenAccount};
use mpl_token_metadata::state::{Creator, DataV2, MAX_URI_LENGTH};

use crate::events::XnftCreated;
use crate::state::{CreateXnftParams, Kind, Xnft};
use crate::CustomError;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateAppXnft<'info> {
    #[account(
        init,
        payer = payer,
        seeds = [
            "mint".as_bytes(),
            publisher.key().as_ref(),
            name.as_bytes(),
        ],
        bump,
        mint::authority = xnft,
        mint::freeze_authority = xnft,
        mint::decimals = 0,
    )]
    pub master_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        associated_token::authority = publisher,
        associated_token::mint = master_mint,
    )]
    pub master_token: Account<'info, TokenAccount>,

    /// CHECK: Account allocation and initialization is done via CPI to the metadata program.
    #[account(
        mut,
        seeds = [
            "metadata".as_bytes(),
            metadata_program.key().as_ref(),
            master_mint.key().as_ref(),
        ],
        seeds::program = metadata_program.key(),
        bump,
    )]
    pub master_metadata: UncheckedAccount<'info>,

    #[account(
        init,
        payer = payer,
        space = Xnft::LEN,
        seeds = [
            "xnft".as_bytes(),
            master_mint.key().as_ref(),
        ],
        bump,
    )]
    pub xnft: Box<Account<'info, Xnft>>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub publisher: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> CreateAppXnft<'info> {
    pub fn create_metadata_accounts_ctx(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, CreateMetadataAccountsV3<'info>> {
        let program = self.metadata_program.to_account_info();
        let accounts = CreateMetadataAccountsV3 {
            metadata: self.master_metadata.to_account_info(),
            mint: self.master_mint.to_account_info(),
            mint_authority: self.xnft.to_account_info(),
            payer: self.payer.to_account_info(),
            update_authority: self.xnft.to_account_info(),
            system_program: self.system_program.to_account_info(),
            rent: self.rent.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn freeze_account_ctx(&self) -> CpiContext<'_, '_, '_, 'info, FreezeAccount<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = FreezeAccount {
            account: self.master_token.to_account_info(),
            authority: self.xnft.to_account_info(),
            mint: self.master_mint.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = MintTo {
            mint: self.master_mint.to_account_info(),
            to: self.master_token.to_account_info(),
            authority: self.xnft.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn sign_metadata_ctx(&self) -> CpiContext<'_, '_, '_, 'info, SignMetadata<'info>> {
        let program = self.metadata_program.to_account_info();
        let accounts = SignMetadata {
            creator: self.publisher.to_account_info(),
            metadata: self.master_metadata.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn update_primary_sale_happened_ctx(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, UpdatePrimarySaleHappenedViaToken<'info>> {
        let program = self.metadata_program.to_account_info();
        let accounts = UpdatePrimarySaleHappenedViaToken {
            metadata: self.master_metadata.to_account_info(),
            owner: self.publisher.to_account_info(),
            token: self.master_token.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}

pub fn create_app_xnft_handler(
    ctx: Context<CreateAppXnft>,
    name: String,
    params: CreateXnftParams,
) -> Result<()> {
    // Check the length of the metadata uri provided.
    //
    // The argued name does not need to be validated since the maximum
    // length is the same as the max seed length, meaning the instruction
    // will already fail if the name exceeds that.
    require!(
        params.uri.len() <= MAX_URI_LENGTH,
        CustomError::UriExceedsMaxLength,
    );

    // Check that if a supply was provided it is greater than 0.
    if let Some(s) = params.supply {
        require_gt!(s, 0);
    }

    // Initialize and populate the new xNFT program account data.
    let xnft = &mut ctx.accounts.xnft;
    ***xnft = Xnft::try_new(
        Kind::App,
        *ctx.bumps.get("xnft").unwrap(),
        *ctx.accounts.publisher.key,
        *ctx.accounts.master_metadata.key,
        ctx.accounts.master_mint.key(),
        Some(name.clone()),
        &params,
    )?;

    // Mint the master token.
    token::mint_to(
        ctx.accounts
            .mint_to_ctx()
            .with_signer(&[&ctx.accounts.xnft.as_seeds()]),
        1,
    )?;

    // Freeze the token account after minting.
    token::freeze_account(
        ctx.accounts
            .freeze_account_ctx()
            .with_signer(&[&ctx.accounts.xnft.as_seeds()]),
    )?;

    // Set field values for unnamed or calculated MPL metadata properties.
    let is_mutable = true;
    let update_authority_is_signer = true;

    // Validation that share percentage splits sums up to 100 is
    // done by MPL in the `create_metadata_accounts_v3` CPI call
    // and verification that the publisher is among the list of creators
    // is done via the `sign_metadata` CPI call to verify the pubkey.
    let creators = Some(
        params
            .creators
            .iter()
            .map(|c| Creator {
                address: c.address,
                share: c.share,
                verified: false,
            })
            .collect(),
    );

    metadata::create_metadata_accounts_v3(
        ctx.accounts
            .create_metadata_accounts_ctx()
            .with_signer(&[&ctx.accounts.xnft.as_seeds()]),
        DataV2 {
            name,
            symbol: params.symbol,
            uri: params.uri,
            seller_fee_basis_points: params.seller_fee_basis_points,
            creators,
            collection: None,
            uses: None,
        },
        is_mutable,
        update_authority_is_signer,
        None,
    )?;

    // Verify the publisher in the list of creators on the metadata.
    // The remainder of the creators in the list must invoke MPL
    // `sign_metadata` on their own so that they are the signers of the tx.
    metadata::sign_metadata(ctx.accounts.sign_metadata_ctx())?;

    // Set the primary sale has happened flag to true on metadata.
    metadata::update_primary_sale_happened_via_token(
        ctx.accounts.update_primary_sale_happened_ctx(),
    )?;

    emit!(XnftCreated {
        tag: params.tag,
        xnft: ctx.accounts.xnft.key(),
    });

    Ok(())
}
