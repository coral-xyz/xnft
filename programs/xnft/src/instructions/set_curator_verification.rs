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

use crate::state::Xnft;
use crate::CustomError;

#[derive(Accounts)]
pub struct SetCuratorVerification<'info> {
    #[account(
        mut,
        constraint = xnft.curator.as_ref().map(|c| c.pubkey) == Some(*curator.key) @ CustomError::CuratorMismatch,
    )]
    pub xnft: Account<'info, Xnft>,

    pub curator: Signer<'info>,
}

pub fn set_curator_verification_handler(
    ctx: Context<SetCuratorVerification>,
    value: bool,
) -> Result<()> {
    if let Some(curator) = &mut ctx.accounts.xnft.curator {
        curator.verified = value;
    } else {
        return Err(error!(CustomError::CuratorMismatch));
    }
    Ok(())
}
