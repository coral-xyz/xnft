// Copyright (C) 2022 Blue Coral, Inc.

use anchor_lang::prelude::*;

use crate::events::AccessGranted;
use crate::state::{Access, Xnft};

#[derive(Accounts)]
pub struct GrantAccess<'info> {
    #[account(
        constraint = xnft.install_authority == Some(*authority.key),
    )]
    pub xnft: Account<'info, Xnft>,

    /// CHECK: validation is not required for wallet being granted access.
    pub wallet: UncheckedAccount<'info>,

    ////////////////////////////////////////////////////////////////////////////
    // Auto derived below.
    ////////////////////////////////////////////////////////////////////////////
    #[account(
        init,
        payer = authority,
        space = Access::LEN,
        seeds = [
            "access".as_bytes(),
            wallet.key().as_ref(),
            xnft.key().as_ref(),
        ],
        bump,
    )]
    pub access: Account<'info, Access>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn grant_access_handler(ctx: Context<GrantAccess>) -> Result<()> {
    let access = &mut ctx.accounts.access;
    let xnft = &ctx.accounts.xnft;

    **access = Access::new(
        *ctx.accounts.wallet.key,
        xnft.key(),
        *ctx.bumps.get("access").unwrap(),
    );

    emit!(AccessGranted {
        wallet: *ctx.accounts.wallet.key,
        xnft: xnft.key(),
    });

    Ok(())
}
