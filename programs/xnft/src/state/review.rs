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

use super::Xnft;

#[account]
pub struct Review {
    /// The pubkey of the account that created the review (32).
    pub author: Pubkey,
    /// The pubkey of the associated xNFT (32).
    pub xnft: Pubkey,
    /// The numerical rating for the review, 0-5 (1).
    pub rating: u8,
    /// The URI of the off-chain JSON data that holds the comment (4 + len).
    pub uri: String,
    /// Unused reserved byte space for future additive changes.
    pub _reserved: [u8; 32],
}

impl Review {
    pub fn len(uri: String) -> usize {
        8 + 32 + 32 + 1 + (4 + uri.len()) + 32
    }

    pub fn new(xnft: &mut Account<'_, Xnft>, author: &Pubkey, uri: String, rating: u8) -> Self {
        xnft.total_rating += std::convert::TryInto::<u64>::try_into(rating).unwrap();
        xnft.num_ratings += 1;

        Self {
            author: *author,
            xnft: xnft.key(),
            rating,
            uri,
            _reserved: [0; 32],
        }
    }
}
