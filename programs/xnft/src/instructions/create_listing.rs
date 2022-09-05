use anchor_lang::prelude::*;
use anchor_spl::token::spl_token::instruction::AuthorityType;
use anchor_spl::token::{set_authority, SetAuthority, Token, TokenAccount};

use crate::state::{Listing, Xnft};

#[derive(Accounts)]
pub struct CreateListing<'info> {
    #[account(
        init,
        payer = payer,
        space = Listing::LEN,
        seeds = [
            "listing".as_bytes(),
            xnft.key().as_ref(),
        ],
        bump,
    )]
    pub listing: Account<'info, Listing>,

    #[account(
        mut,
        constraint = master_token.mint == xnft.master_mint,
        constraint = master_token.owner == *authority.key,
    )]
    pub master_token: Account<'info, TokenAccount>,

    #[account(
        has_one = authority,
    )]
    pub xnft: Account<'info, Xnft>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

impl<'info> CreateListing<'info> {
    pub fn set_authority_ctx(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = SetAuthority {
            account_or_mint: self.master_token.to_account_info(),
            current_authority: self.authority.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}

pub fn create_listing_handler(ctx: Context<CreateListing>, price: u64) -> Result<()> {
    set_authority(
        ctx.accounts.set_authority_ctx(),
        AuthorityType::AccountOwner,
        Some(ctx.accounts.listing.key()),
    )?;

    let listing = &mut ctx.accounts.listing;
    listing.authority = ctx.accounts.authority.key();
    listing.xnft = ctx.accounts.xnft.key();
    listing.price = price;
    listing.bump = *ctx.bumps.get("listing").unwrap();

    Ok(())
}
