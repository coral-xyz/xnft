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
use anchor_spl::token::TokenAccount;

use crate::state::{CuratorStatus, Xnft};
use crate::CustomError;

#[derive(Accounts)]
pub struct SetCurator<'info> {
    #[account(mut)]
    pub xnft: Account<'info, Xnft>,

    #[account(
        associated_token::mint = xnft.master_mint,
        associated_token::authority = authority,
    )]
    pub master_token: Account<'info, TokenAccount>,

    /// CHECK: allow any account to be assigned as a curator.
    pub curator: UncheckedAccount<'info>,

    pub authority: Signer<'info>,
}

pub fn set_curator_handler(ctx: Context<SetCurator>) -> Result<()> {
    let xnft = &mut ctx.accounts.xnft;

    if let Some(CuratorStatus { verified: true, .. }) = xnft.curator {
        return Err(error!(CustomError::CuratorAlreadySet));
    }

    xnft.curator = Some(CuratorStatus {
        pubkey: *ctx.accounts.curator.key,
        verified: false,
    });

    Ok(())
}
