// Copyright (C) 2022 Blue Coral, Inc.

use anchor_lang::prelude::*;

use crate::state::Curator;

#[derive(Accounts)]
pub struct CreateCurator<'info> {
    #[account(
        init,
        payer = payer,
        space = Curator::LEN,
        seeds = [
            "curator".as_bytes(),
            authority.key().as_ref(),
        ],
        bump,
    )]
    pub curator: Account<'info, Curator>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_curator_handler(
    ctx: Context<CreateCurator>,
    sign_on_create: bool,
    sign_on_update: bool,
    sign_on_delete: bool,
) -> Result<()> {
    let curator = &mut ctx.accounts.curator;

    **curator = Curator {
        authority: *ctx.accounts.authority.key,
        signature_requirements: [sign_on_create, sign_on_update, sign_on_delete],
        bump: *ctx.bumps.get("curator").unwrap(),
        _reserved: [0; 64],
    };

    Ok(())
}
