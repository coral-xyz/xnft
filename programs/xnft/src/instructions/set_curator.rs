// Copyright (C) 2022 Blue Coral, Inc.

use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

use crate::state::{CuratorStatus, Xnft};

#[derive(Accounts)]
pub struct SetCurator<'info> {
    #[account(mut)]
    pub xnft: Account<'info, Xnft>,

    #[account(
        associated_token::mint = xnft.master_mint,
        associated_token::authority = authority,
    )]
    pub master_token: Account<'info, TokenAccount>,

    /// CHECK: allow any account to be assigned as a curator.
    pub curator: UncheckedAccount<'info>,

    pub authority: Signer<'info>,
}

pub fn set_curator_handler(ctx: Context<SetCurator>) -> Result<()> {
    let xnft = &mut ctx.accounts.xnft;
    xnft.curator = Some(CuratorStatus {
        pubkey: *ctx.accounts.curator.key,
        verified: false,
    });
    Ok(())
}
