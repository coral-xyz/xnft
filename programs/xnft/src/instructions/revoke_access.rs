// Copyright (C) 2022 Blue Coral, Inc.
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

use crate::state::{Access, Xnft};

#[derive(Accounts)]
pub struct RevokeAccess<'info> {
    #[account(
        constraint = xnft.install_authority == Some(*authority.key),
    )]
    pub xnft: Account<'info, Xnft>,

    /// CHECK: validated with has_one and seeding on `access`.
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
