use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

use crate::state::{Install, Review, Xnft};
use crate::{CustomError, MAX_RATING};

#[derive(Accounts)]
#[instruction(uri: String)]
pub struct CreateReview<'info> {
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

    #[account(
        has_one = xnft @ CustomError::ReviewInstallMismatch,
        constraint = install.authority == *author.key @ CustomError::InstallAuthorityMismatch,
    )]
    pub install: Account<'info, Install>,

    #[account(
        constraint = master_token.mint == xnft.master_mint,
        constraint = master_token.owner != *author.key @ CustomError::CannotReviewOwned,
    )]
    pub master_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = xnft.publisher != *author.key @ CustomError::CannotReviewOwned,
    )]
    pub xnft: Account<'info, Xnft>,

    #[account(mut)]
    pub author: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_review_handler(ctx: Context<CreateReview>, uri: String, rating: u8) -> Result<()> {
    let xnft = &mut ctx.accounts.xnft;
    let review = &mut ctx.accounts.review;

    if rating > MAX_RATING {
        return Err(error!(CustomError::RatingOutOfBounds));
    }

    xnft.total_rating += std::convert::TryInto::<u64>::try_into(rating).unwrap();
    xnft.num_ratings += 1;

    review.author = *ctx.accounts.author.key;
    review.xnft = ctx.accounts.xnft.key();
    review.rating = rating;
    review.uri = uri;

    Ok(())
}
