use anchor_lang::prelude::*;

use crate::state::{Install, Review, Xnft};
use crate::CustomError;

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
        mut,
        constraint = xnft.authority != *author.key @ CustomError::CannotReviewOwned
    )]
    pub xnft: Account<'info, Xnft>,

    #[account(mut)]
    pub author: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_review_handler(ctx: Context<CreateReview>, uri: String, rating: u8) -> Result<()> {
    let xnft = &mut ctx.accounts.xnft;
    let review = &mut ctx.accounts.review;

    if rating > Review::MAX_RATING {
        return Err(error!(CustomError::RatingOutOfBounds));
    }

    xnft.total_rating = xnft.total_rating.checked_add(rating.into()).unwrap();
    xnft.num_ratings = xnft.num_ratings.checked_add(1).unwrap();

    review.author = *ctx.accounts.author.key;
    review.xnft = ctx.accounts.xnft.key();
    review.rating = rating;
    review.uri = uri;

    Ok(())
}
