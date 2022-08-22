use anchor_lang::prelude::*;

use crate::state::Install;

#[derive(Accounts)]
pub struct DeleteInstall<'info> {
    #[account(
        mut,
        close = receiver,
        has_one = authority,
    )]
    pub install: Account<'info, Install>,

    /// CHECK: the account receiving the rent doesn't need validation.
    #[account(mut)]
    pub receiver: UncheckedAccount<'info>,

    pub authority: Signer<'info>,
}

pub fn delete_install_handler(_ctx: Context<DeleteInstall>) -> Result<()> {
    Ok(())
}
