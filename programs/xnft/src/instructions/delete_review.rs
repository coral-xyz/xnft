use anchor_lang::prelude::*;

use crate::state::{Review, Xnft};

#[derive(Accounts)]
pub struct DeleteReview<'info> {
    #[account(
        mut,
        close = receiver,
        has_one = author,
        has_one = xnft,
    )]
    pub review: Account<'info, Review>,

    #[account(mut)]
    pub xnft: Account<'info, Xnft>,

    /// CHECK: the account receiving the rent doesn't need validation.
    #[account(mut)]
    pub receiver: UncheckedAccount<'info>,

    pub author: Signer<'info>,
}

pub fn delete_review_handler(ctx: Context<DeleteReview>) -> Result<()> {
    let review = &ctx.accounts.review;
    let xnft = &mut ctx.accounts.xnft;

    xnft.num_ratings = xnft.num_ratings.checked_sub(1).unwrap();
    xnft.total_rating = xnft.total_rating.checked_sub(review.rating.into()).unwrap();
    Ok(())
}
