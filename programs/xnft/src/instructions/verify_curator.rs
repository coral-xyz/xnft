// Copyright (C) 2022 Blue Coral, Inc.

use anchor_lang::prelude::*;

use crate::state::{Curator, Xnft};
use crate::CustomError;

#[derive(Accounts)]
pub struct VerifyCurator<'info> {
    #[account(
        mut,
        constraint = xnft.curator.is_some() @ CustomError::CuratorNotSet,
        constraint = xnft.curator.as_ref().unwrap().pubkey == curator.key() @ CustomError::CuratorMismatch,
    )]
    pub xnft: Account<'info, Xnft>,

    #[account(
        has_one = authority,
    )]
    pub curator: Account<'info, Curator>,

    pub authority: Signer<'info>,
}

pub fn verify_curator_handler(ctx: Context<VerifyCurator>) -> Result<()> {
    if let Some(curator) = &mut ctx.accounts.xnft.curator {
        curator.verified = true;
    }
    Ok(())
}
