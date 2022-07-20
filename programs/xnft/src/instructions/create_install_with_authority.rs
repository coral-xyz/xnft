use anchor_lang::prelude::*;

use crate::state::{Install, Xnft2};
use crate::CustomError;

#[derive(Accounts)]
pub struct CreateInstallWithAuthority<'info> {
    #[account(
        mut,
        constraint = xnft.install_authority == Some(install_authority.key()),
        constraint = !xnft.suspended @ CustomError::SuspendedInstallation,
    )]
    pub xnft: Account<'info, Xnft2>,

    ////////////////////////////////////////////////////////////////////////////
    // Auto derived below.
    ////////////////////////////////////////////////////////////////////////////
    #[account(
        init,
        payer = authority,
        space = Install::LEN,
        seeds = [
            "install".as_bytes(),
            authority.key().as_ref(),
        ],
        bump,
    )]
    pub install: Account<'info, Install>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub install_authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_install_with_authority_handler(
    _ctx: Context<CreateInstallWithAuthority>,
) -> Result<()> {
    // TODO:
    Ok(())
}
