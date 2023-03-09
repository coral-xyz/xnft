// Copyright (C) 2023 Blue Coral, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::events::InstallationCreated;
use crate::state::{Access, Install, Kind, Xnft};
use crate::CustomError;

#[derive(Accounts)]
pub struct CreatePermissionedInstall<'info> {
    #[account(
        mut,
        has_one = install_vault,
        constraint = xnft.kind == Kind::App @ CustomError::MustBeApp,
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
    // an accepted `access` account that passed the constraints asserts that the
    // signing wallet does in fact have whitelisted permission to install this xNFT
    // regardless of the state of it's `install_authority`.
    xnft.verify_supply()?;

    // Pay to install the xNFT, if needed.
    if xnft.install_price > 0 {
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: ctx.accounts.install_vault.to_account_info(),
                },
            ),
            xnft.install_price,
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
