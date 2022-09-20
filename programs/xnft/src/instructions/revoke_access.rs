use anchor_lang::prelude::*;

use crate::state::{Access, Xnft};

#[derive(Accounts)]
pub struct RevokeAccess<'info> {
    #[account(
        constraint = xnft.install_authority == Some(*authority.key),
    )]
    pub xnft: Account<'info, Xnft>,

    /// CHECK: validated with has_one and seeding on `access`.
    #[account(mut)]
    pub wallet: UncheckedAccount<'info>,

    ////////////////////////////////////////////////////////////////////////////
    // Auto derived below.
    ////////////////////////////////////////////////////////////////////////////
    #[account(
        mut,
        close = authority,
        seeds = [
            "access".as_bytes(),
            wallet.key().as_ref(),
            xnft.key().as_ref(),
        ],
        bump = access.bump,
        has_one = wallet,
        has_one = xnft,
    )]
    pub access: Account<'info, Access>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn revoke_access_handler(_ctx: Context<RevokeAccess>) -> Result<()> {
    Ok(())
}
