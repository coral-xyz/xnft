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

#[account]
pub struct Access {
    /// The pubkey of the wallet being granted access (32).
    pub wallet: Pubkey,
    /// The pubkey of the xNFT account that is access gated (32).
    pub xnft: Pubkey,
    /// Bump nonce of the PDA (1).
    pub bump: u8,
    /// Unused reserved byte space for additive future changes.
    pub _reserved: [u8; 32],
}

impl Access {
    pub const LEN: usize = 8 + (32 * 2) + 1 + 32;

    pub fn new(wallet: Pubkey, xnft: Pubkey, bump: u8) -> Self {
        Self {
            bump,
            wallet,
            xnft,
            _reserved: [0; 32],
        }
    }
}
