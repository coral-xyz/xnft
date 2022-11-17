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
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{
    self, CloseAccount, FreezeAccount, ThawAccount, Token, TokenAccount, Transfer as TokenTransfer,
};

use crate::state::Xnft;

#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(
        has_one = master_mint,
    )]
    pub xnft: Account<'info, Xnft>,

    #[account(
        mut,
        associated_token::mint = master_mint,
        associated_token::authority = authority,
        constraint = source.amount == 1,
    )]
    pub source: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        associated_token::mint = master_mint,
        associated_token::authority = recipient,
    )]
    pub destination: Account<'info, TokenAccount>,

    /// CHECK: validated with `has_one` on the xNFT account
    pub master_mint: UncheckedAccount<'info>,

    pub recipient: SystemAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> Transfer<'info> {
    pub fn close_account_ctx(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = CloseAccount {
            account: self.source.to_account_info(),
            authority: self.authority.to_account_info(),
            destination: self.authority.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn freeze_account_ctx(&self) -> CpiContext<'_, '_, '_, 'info, FreezeAccount<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = FreezeAccount {
            account: self.destination.to_account_info(),
            authority: self.xnft.to_account_info(),
            mint: self.master_mint.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn thaw_account_ctx(&self) -> CpiContext<'_, '_, '_, 'info, ThawAccount<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = ThawAccount {
            account: self.source.to_account_info(),
            authority: self.xnft.to_account_info(),
            mint: self.master_mint.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, TokenTransfer<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = TokenTransfer {
            authority: self.authority.to_account_info(),
            from: self.source.to_account_info(),
            to: self.destination.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}

pub fn transfer_handler(ctx: Context<Transfer>) -> Result<()> {
    let xnft = &ctx.accounts.xnft;

    // Unfreeze the token account if it is frozen.
    token::thaw_account(
        ctx.accounts
            .thaw_account_ctx()
            .with_signer(&[&xnft.as_seeds()]),
    )?;

    // Transfer the token in the source account to the recipient's destination token account.
    token::transfer(ctx.accounts.transfer_ctx(), ctx.accounts.source.amount)?;

    // Freeze the new account if necessary
    token::freeze_account(
        ctx.accounts
            .freeze_account_ctx()
            .with_signer(&[&xnft.as_seeds()]),
    )?;

    token::close_account(ctx.accounts.close_account_ctx())?;

    Ok(())
}
