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
    let xnft = &mut ctx.accounts.xnft;
    let review = &ctx.accounts.review;

    xnft.num_ratings -= 1;
    xnft.total_rating -= std::convert::TryInto::<u64>::try_into(review.rating).unwrap();
    Ok(())
}
