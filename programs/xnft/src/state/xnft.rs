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

use super::{Kind, Tag, L1};
use crate::util::verify_optional_pubkey;
use crate::{CustomError, MAX_NAME_LEN};

#[account]
#[cfg_attr(test, derive(Default))]
pub struct Xnft {
    /// The pubkey of the original xNFT creator (32).
    pub publisher: Pubkey,
    /// The pubkey of the account to receive install payments (32).
    pub install_vault: Pubkey,
    /// The pubkey of the MPL master edition account (32).
    pub master_edition: Pubkey,
    /// The pubkey of the MPL master metadata account (32).
    pub master_metadata: Pubkey,
    /// The pubkey of the master token mint (32).
    pub master_mint: Pubkey,
    /// The optional pubkey of the xNFT installation authority (33).
    pub install_authority: Option<Pubkey>,
    /// The bump nonce for the xNFT's PDA (1).
    pub bump: u8,
    /// The `Kind` enum variant describing the type of xNFT (1).
    pub kind: Kind,
    /// The `Tag` enum variant to assign the category of xNFT (1).
    pub tag: Tag,
    /// The display name of the xNFT account (MAX_NAME_LEN).
    pub name: String,
    /// Total amount of install accounts that have been created for this xNFT (8).
    pub total_installs: u64,
    /// The price-per-install of this xNFT (8).
    pub install_price: u64,
    /// The unix timestamp of when the account was created (8).
    pub created_ts: i64,
    /// The unix timestamp of the last time the account was updated (8).
    pub updated_ts: i64,
    /// Flag to determine whether new installations of the xNFT should be halted (1).
    pub suspended: bool,
    /// The total cumulative rating value of all reviews (8).
    pub total_rating: u64,
    /// The number of ratings created used to calculate the average (4).
    pub num_ratings: u32,
    /// The `L1` enum variant to designate the associated blockchain (1).
    pub l1: L1,
    /// The optional finite supply of installations available for this xNFT (9).
    pub supply: Option<u64>,
    /// Optional pubkey of the global authority required for reviewing xNFT updates (34).
    pub curator: Option<CuratorStatus>,
    /// Unused reserved byte space for additive future changes.
    pub _reserved: [u8; 26],
}

impl Xnft {
    pub const LEN: usize =
        8 + (32 * 5) + 33 + 1 + 1 + 1 + (4 + MAX_NAME_LEN) + (8 * 4) + 1 + 8 + 4 + 1 + 9 + 34 + 26;

    pub fn verify_supply(&self) -> anchor_lang::Result<()> {
        if let Some(supply) = self.supply {
            if supply > 0 && self.total_installs >= supply {
                return Err(error!(CustomError::InstallExceedsSupply));
            }
        }
        Ok(())
    }

    verify_optional_pubkey!(
        verify_install_authority,
        install_authority,
        CustomError::InstallAuthorityMismatch
    );
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CuratorStatus {
    /// The pubkey of the `Curator` program account (32).
    pub pubkey: Pubkey,
    /// Whether the curator's authority has verified the assignment (1).
    pub verified: bool,
}

#[cfg(test)]
mod tests {
    use anchor_lang::prelude::Pubkey;
    use std::str::FromStr;

    use crate::CustomError;

    use super::Xnft;

    #[test]
    fn account_size_matches() {
        assert_eq!(Xnft::LEN, 353);
    }

    #[test]
    fn install_authority_checks() {
        let mut x = Xnft::default();
        assert!(x.verify_install_authority(&Pubkey::default()).is_ok());

        x.install_authority =
            Some(Pubkey::from_str("BaHSGaf883GA3u8qSC5wNigcXyaScJLSBJZbALWvPcjs").unwrap());

        assert_eq!(
            x.verify_install_authority(&Pubkey::default()).unwrap_err(),
            anchor_lang::error::Error::from(CustomError::InstallAuthorityMismatch),
        );

        assert!(x
            .verify_install_authority(&x.install_authority.unwrap())
            .is_ok());
    }

    #[test]
    fn over_supplied_installed_checks() {
        let mut x = Xnft::default();
        assert!(x.verify_supply().is_ok());

        x.supply = Some(1);
        x.total_installs = 1;
        assert_eq!(
            x.verify_supply().unwrap_err(),
            anchor_lang::error::Error::from(CustomError::InstallExceedsSupply),
        );
    }
}
