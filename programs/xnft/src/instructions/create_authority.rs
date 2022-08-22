use anchor_lang::prelude::*;

use crate::state::ControlAuthority;

#[derive(Accounts)]
pub struct CreateAuthority<'info> {
    #[account(
        init,
        payer = payer,
        space = ControlAuthority::LEN,
        seeds = [
            "authority".as_bytes(),
        ],
        bump,
    )]
    pub authority: Account<'info, ControlAuthority>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_authority_handler(ctx: Context<CreateAuthority>) -> Result<()> {
    let authority = &mut ctx.accounts.authority;
    authority.bump = *ctx.bumps.get("authority").unwrap();
    Ok(())
}
