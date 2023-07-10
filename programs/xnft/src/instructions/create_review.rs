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
use anchor_spl::token::TokenAccount;

use crate::events::ReviewCreated;
use crate::state::{Install, Kind, Review, Xnft};
use crate::{CustomError, MAX_RATING, MIN_RATING};

#[derive(Accounts)]
#[instruction(uri: String)]
pub struct CreateReview<'info> {
    #[account(
        has_one = xnft @ CustomError::ReviewInstallMismatch,
        constraint = install.authority == *author.key @ CustomError::InstallOwnerMismatch,
    )]
    pub install: Account<'info, Install>,

    #[account(
        constraint = master_token.amount == 1,
        constraint = master_token.mint == xnft.master_mint,
        constraint = master_token.owner != *author.key @ CustomError::CannotReviewOwned,
    )]
    pub master_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = xnft.kind == Kind::App @ CustomError::MustBeApp,
        constraint = xnft.publisher != *author.key @ CustomError::CannotReviewOwned,
    )]
    pub xnft: Account<'info, Xnft>,

    ////////////////////////////////////////////////////////////////////////////
    // Auto derived below.
    ////////////////////////////////////////////////////////////////////////////
    #[account(
        init,
        payer = author,
        space = Review::len(uri),
        seeds = [
            "review".as_bytes(),
            xnft.key().as_ref(),
            author.key().as_ref(),
        ],
        bump,
    )]
    pub review: Account<'info, Review>,

    #[account(mut)]
    pub author: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_review_handler(ctx: Context<CreateReview>, uri: String, rating: u8) -> Result<()> {
    let xnft = &mut ctx.accounts.xnft;
    let review = &mut ctx.accounts.review;

    if !(MIN_RATING..=MAX_RATING).contains(&rating) {
        return Err(error!(CustomError::RatingOutOfBounds));
    }

    **review = Review::new(xnft, ctx.accounts.author.key, uri, rating);

    emit!(ReviewCreated {
        author: ctx.accounts.author.key(),
        rating,
        xnft: ctx.accounts.xnft.key(),
    });

    Ok(())
}
