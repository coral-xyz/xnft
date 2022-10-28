// Copyright (C) 2022 Blue Coral, Inc.

use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, CloseAccount, FreezeAccount, Mint, ThawAccount, Token, TokenAccount,
    Transfer as TokenTransfer,
};

use crate::state::Xnft;

#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(
        has_one = master_mint,
    )]
    pub xnft: Account<'info, Xnft>,

    #[account(
        constraint = master_mint.decimals == 0,
    )]
    pub master_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = master_mint,
        associated_token::authority = authority,
        constraint = source.amount == 1,
    )]
    pub source: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = master_mint,
        associated_token::authority = recipient,
    )]
    pub destination: Account<'info, TokenAccount>,

    pub recipient: SystemAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
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
    let mut was_frozen = false;

    // Unfreeze the token account if it is frozen.
    if ctx.accounts.source.is_frozen() {
        was_frozen = true;
        token::thaw_account(ctx.accounts.thaw_account_ctx().with_signer(&[&[
            "xnft".as_bytes(),
            xnft.master_edition.as_ref(),
            &[xnft.bump],
        ]]))?;
    }

    // Transfer the token in the source account to the recipient's destination token account.
    token::transfer(ctx.accounts.transfer_ctx(), ctx.accounts.source.amount)?;

    // Freeze the new account if necessary
    if was_frozen {
        token::freeze_account(ctx.accounts.freeze_account_ctx().with_signer(&[&[
            "xnft".as_bytes(),
            xnft.master_edition.as_ref(),
            &[xnft.bump],
        ]]))?;
    }

    token::close_account(ctx.accounts.close_account_ctx())?;

    Ok(())
}
