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
use crate::state::{Install, Kind, Xnft};
use crate::CustomError;

#[derive(Accounts)]
pub struct CreateInstall<'info> {
    #[account(
        mut,
        has_one = install_vault,
        constraint = xnft.kind == Kind::App @ CustomError::MustBeApp,
        constraint = !xnft.suspended @ CustomError::SuspendedInstallation,
    )]
    pub xnft: Account<'info, Xnft>,

    /// CHECK: xnft has_one constraint.
    #[account(mut)]
    pub install_vault: UncheckedAccount<'info>,

    ////////////////////////////////////////////////////////////////////////////
    // Auto derived below.
    ////////////////////////////////////////////////////////////////////////////
    #[account(
        init,
        payer = target,
        space = Install::LEN,
        seeds = [
            "install".as_bytes(),
            target.key().as_ref(),
            xnft.key().as_ref(),
        ],
        bump,
    )]
    pub install: Account<'info, Install>,

    #[account(mut)]
    pub target: Signer<'info>,
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_install_handler(ctx: Context<CreateInstall>) -> Result<()> {
    let xnft = &mut ctx.accounts.xnft;
    let install = &mut ctx.accounts.install;

    xnft.verify_supply()?;
    xnft.verify_install_authority(ctx.accounts.authority.key)?;

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
    **install = Install::new(xnft, ctx.accounts.target.key);

    emit!(InstallationCreated {
        installer: ctx.accounts.target.key(),
        xnft: xnft.key(),
    });

    Ok(())
}
