use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

use crate::state::Xnft;

#[derive(Accounts)]
pub struct SetSuspended<'info> {
    #[account(mut)]
    pub xnft: Account<'info, Xnft>,

    #[account(
        constraint = master_token.mint == xnft.master_mint,
        constraint = master_token.owner == *authority.key,
    )]
    pub master_token: Account<'info, TokenAccount>,

    pub authority: Signer<'info>,
}

pub fn set_suspended_handler(ctx: Context<SetSuspended>, flag: bool) -> Result<()> {
    let xnft = &mut ctx.accounts.xnft;
    xnft.suspended = flag;
    Ok(())
}
