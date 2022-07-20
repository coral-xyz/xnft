use anchor_lang::prelude::*;

use crate::state::Xnft2;

#[derive(Accounts)]
pub struct SetSuspended<'info> {
    #[account(
        mut,
        has_one = authority,
    )]
    pub xnft: Account<'info, Xnft2>,

    pub authority: Signer<'info>,
}

pub fn set_suspended_handler(ctx: Context<SetSuspended>, flag: bool) -> Result<()> {
    let xnft = &mut ctx.accounts.xnft;
    xnft.suspended = flag;
    Ok(())
}
