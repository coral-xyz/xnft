// Copyright (C) 2022 Blue Coral, Inc.

use anchor_lang::prelude::*;

use crate::state::Xnft;
use crate::CustomError;

#[derive(Accounts)]
pub struct VerifyCurator<'info> {
    #[account(
        mut,
        constraint = xnft.curator.as_ref().map(|c| c.pubkey) == Some(*curator.key) @ CustomError::CuratorMismatch,
    )]
    pub xnft: Account<'info, Xnft>,

    pub curator: Signer<'info>,
}

pub fn verify_curator_handler(ctx: Context<VerifyCurator>) -> Result<()> {
    if let Some(curator) = &mut ctx.accounts.xnft.curator {
        curator.verified = true;
    }
    Ok(())
}
