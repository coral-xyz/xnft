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
pub struct Install {
    /// The authority who created the installation (32).
    pub authority: Pubkey,
    /// The pubkey of the xNFT that was installed (32).
    pub xnft: Pubkey,
    /// The pubkey of the MPL master metadata account (32).
    pub master_metadata: Pubkey,
    /// The sequential installation number of the xNFT (8).
    pub edition: u64,
    /// Unused reserved byte space for additive future changes.
    pub _reserved: [u8; 64],
}

impl Install {
    pub const LEN: usize = 8 + (32 * 3) + 8 + 64;

    pub fn new(xnft: &mut Account<'_, Xnft>, authority: &Pubkey) -> Self {
        let i = Self {
            authority: *authority,
            xnft: xnft.key(),
            master_metadata: xnft.master_metadata,
            edition: xnft.total_installs,
            _reserved: [0; 64],
        };
        xnft.total_installs += 1;
        i
    }
}

#[cfg(test)]
mod tests {
    use super::Install;

    #[test]
    fn account_size_matches() {
        assert_eq!(Install::LEN, 176);
    }
}
