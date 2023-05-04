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
use anchor_spl::metadata::MetadataAccount;
use anchor_spl::token::{burn, close_account, Burn, CloseAccount, Token, TokenAccount};

use crate::state::{Kind, Xnft};
use crate::CustomError;

#[derive(Accounts)]
pub struct DeleteXnft<'info> {
    #[account(
        mut,
        close = receiver,
        has_one = master_metadata,
        has_one = master_mint,
    )]
    pub xnft: Account<'info, Xnft>,

    #[account(
        mut,
        constraint = master_metadata.update_authority == *authority.key @ CustomError::UpdateAuthorityMismatch,
        constraint = master_metadata.is_mutable @ CustomError::MetadataIsImmutable,
    )]
    pub master_metadata: Account<'info, MetadataAccount>,

    #[account(
        mut,
        associated_token::mint = master_mint,
        associated_token::authority = authority,
        constraint = master_token.amount == 1,
    )]
    pub master_token: Account<'info, TokenAccount>,

    /// CHECK: validated through the `has_one` constraint of the xNFT
    ///        account and the token account mint check.
    #[account(mut)]
    pub master_mint: UncheckedAccount<'info>,

    /// CHECK: the account receiving the rent doesn't need validation.
    #[account(mut)]
    pub receiver: UncheckedAccount<'info>,

    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

impl<'info> DeleteXnft<'info> {
    pub fn burn_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = Burn {
            authority: self.authority.to_account_info(),
            from: self.master_token.to_account_info(),
            mint: self.master_mint.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn close_ata_ctx(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = CloseAccount {
            account: self.master_token.to_account_info(),
            authority: self.authority.to_account_info(),
            destination: self.receiver.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}

pub fn delete_xnft_handler(ctx: Context<DeleteXnft>, with_burn: bool) -> Result<()> {
    let xnft = &ctx.accounts.xnft;
    let master_token = &ctx.accounts.master_token;

    // Collectibles are always deletable since they cannot have installations or reviews,
    // but apps must be verified to have empty reliances in order to allow deletion.
    if xnft.kind == Kind::App {
        require_eq!(xnft.total_installs, 0, CustomError::XnftNotDeletable);
        require_eq!(xnft.num_ratings, 0, CustomError::XnftNotDeletable);
    }

    if with_burn {
        // Burn the SPL token in the master token account.
        burn(ctx.accounts.burn_ctx(), master_token.amount)?;

        // Close the master token SPL associated token account.
        close_account(ctx.accounts.close_ata_ctx())?;
    }

    Ok(())
}
