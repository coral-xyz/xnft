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
use anchor_spl::metadata::MetadataAccount;
use anchor_spl::token::{Mint, TokenAccount};
use mpl_token_metadata::state::MAX_URI_LENGTH;

use crate::state::{CreateXnftParams, Kind, Xnft};
use crate::CustomError;

#[derive(Accounts)]

pub struct CreateAssociatedXnft<'info> {
    #[account(
        constraint = associated_metadata.is_mutable @ CustomError::MetadataIsImmutable,
        constraint = associated_metadata.update_authority == *publisher.key @ CustomError::UpdateAuthorityMismatch,
    )]
    pub associated_metadata: Account<'info, MetadataAccount>,

    #[account(
        associated_token::authority = publisher,
        associated_token::mint = associated_mint,
    )]
    pub associated_token: Account<'info, TokenAccount>,

    #[account(
        constraint = associated_mint.decimals == 0,
        constraint = associated_mint.supply == 1,
    )]
    pub associated_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        space = Xnft::LEN,
        seeds = [
            "xnft".as_bytes(),
            associated_metadata.key().as_ref(),
        ],
        bump,
    )]
    pub xnft: Box<Account<'info, Xnft>>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub publisher: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_associated_xnft_handler(
    ctx: Context<CreateAssociatedXnft>,
    kind: Kind,
    params: CreateXnftParams,
) -> Result<()> {
    // Check the length of the metadata uri provided.
    require!(
        params.uri.len() <= MAX_URI_LENGTH,
        CustomError::UriExceedsMaxLength,
    );

    // Instantiate and populate the xNFT program account data.
    let xnft = &mut ctx.accounts.xnft;
    ***xnft = Xnft::try_new(
        "".to_owned(),
        kind,
        *ctx.bumps.get("xnft").unwrap(),
        *ctx.accounts.publisher.key,
        ctx.accounts.associated_metadata.key(),
        ctx.accounts.associated_mint.key(),
        &params,
    )?;

    Ok(())
}
