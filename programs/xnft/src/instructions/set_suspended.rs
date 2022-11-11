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

use crate::state::Xnft;

#[derive(Accounts)]
pub struct SetSuspended<'info> {
    #[account(mut)]
    pub xnft: Account<'info, Xnft>,

    #[account(
        associated_token::mint = xnft.master_mint,
        associated_token::authority = authority,
        constraint = master_token.amount == 1,
    )]
    pub master_token: Account<'info, TokenAccount>,

    pub authority: Signer<'info>,
}

pub fn set_suspended_handler(ctx: Context<SetSuspended>, flag: bool) -> Result<()> {
    let xnft = &mut ctx.accounts.xnft;
    xnft.suspended = flag;
    Ok(())
}
