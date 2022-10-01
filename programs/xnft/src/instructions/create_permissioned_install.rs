// Copyright (C) 2022 Blue Coral, Inc.

use anchor_lang::prelude::*;

use crate::events::InstallationCreated;
use crate::state::{Access, Install, Xnft};
use crate::util::send_payment;
use crate::CustomError;

#[derive(Accounts)]
pub struct CreatePermissionedInstall<'info> {
    #[account(
        mut,
        has_one = install_vault,
        constraint = !xnft.suspended @ CustomError::SuspendedInstallation,
    )]
    pub xnft: Account<'info, Xnft>,

    /// CHECK: xnft has_one constraint
    #[account(mut)]
    pub install_vault: UncheckedAccount<'info>,

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
            xnft.key().as_ref(),
        ],
        bump,
    )]
    pub install: Account<'info, Install>,

    #[account(
        seeds = [
            "access".as_bytes(),
            authority.key().as_ref(),
            xnft.key().as_ref(),
        ],
        bump = access.bump,
        has_one = xnft,
        constraint = access.wallet == *authority.key @ CustomError::UnauthorizedInstall,
    )]
    pub access: Account<'info, Access>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_permissioned_install_handler(ctx: Context<CreatePermissionedInstall>) -> Result<()> {
    let xnft = &mut ctx.accounts.xnft;
    let install = &mut ctx.accounts.install;

    // No validation of the install authority is necessary here. The existence of
    // and accepted `access` account that passed the constraints asserts that the
    // signing wallet does in fact have whitelisted permission to install this xNFT
    // regardless of the state of it's `install_authority`.
    xnft.check_supply()?;

    // Pay to install the xNFT, if needed.
    if xnft.install_price > 0 {
        send_payment(
            xnft.install_price,
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.install_vault.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        )?;
    }

    // Initialize the install data.
    **install = Install::new(xnft, ctx.accounts.authority.key);

    emit!(InstallationCreated {
        installer: ctx.accounts.authority.key(),
        xnft: xnft.key(),
    });

    Ok(())
}
