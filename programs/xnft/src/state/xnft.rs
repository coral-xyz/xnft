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
use mpl_token_metadata::state::{MAX_NAME_LENGTH, MAX_URI_LENGTH};

use super::CreateXnftParams;
use crate::CustomError;

#[account]
pub struct Xnft {
    /// The pubkey of the original xNFT creator (32).
    pub publisher: Pubkey,
    /// The pubkey of the account to receive install payments (32).
    pub install_vault: Pubkey,
    /// The pubkey of the MPL master metadata account (32).
    pub master_metadata: Pubkey,
    /// The pubkey of the master token mint (32).
    pub master_mint: Pubkey,
    /// The optional pubkey of the xNFT installation authority (33).
    pub install_authority: Option<Pubkey>,
    /// Optional pubkey of the global authority required for reviewing xNFT updates (34).
    pub curator: Option<CuratorStatus>,
    /// The URI of the custom metadata blob for the xNFT (4 + mpl_token_metadata::state::MAX_URI_LENGTH).
    pub uri: String,
    /// The original name used to seed the master mint if it was a standalone (1 + 4 + mpl_token_metadata::state::MAX_NAME_LENGTH).
    pub mint_seed_name: Option<String>,
    /// The `Kind` enum variant describing the type of xNFT (1).
    pub kind: Kind,
    /// The `Tag` enum variant to assign the category of xNFT (1).
    pub tag: Tag,
    /// The optional finite supply of installations available for this xNFT (9).
    pub supply: Option<u64>,
    /// Total amount of install accounts that have been created for this xNFT (8).
    pub total_installs: u64,
    /// The price-per-install of this xNFT (8).
    pub install_price: u64,
    /// The unix timestamp of when the account was created (8).
    pub created_ts: i64,
    /// The unix timestamp of the last time the account was updated (8).
    pub updated_ts: i64,
    /// The total cumulative rating value of all reviews (8).
    pub total_rating: u64,
    /// The number of ratings created used to calculate the average (4).
    pub num_ratings: u32,
    /// Flag to determine whether new installations of the xNFT should be halted (1).
    pub suspended: bool,
    /// The bump nonce for the xNFT's PDA (1).
    pub bump: [u8; 1],
    /// Unused reserved byte space for additive future changes.
    pub _reserved0: [u8; 64],
    pub _reserved1: [u8; 24],
    pub _reserved2: [u8; 9],
}

impl Xnft {
    pub const LEN: usize = 8
        + (32 * 4)
        + 33
        + 34
        + (4 + MAX_URI_LENGTH)
        + (1 + 4 + MAX_NAME_LENGTH)
        + 1
        + 1
        + 9
        + (8 * 5)
        + 4
        + 1
        + 1
        + 97;

    pub fn try_new(
        kind: Kind,
        bump: u8,
        publisher: Pubkey,
        master_metadata: Pubkey,
        master_mint: Pubkey,
        seed_name: Option<String>,
        params: &CreateXnftParams,
    ) -> anchor_lang::Result<Self> {
        let now = Clock::get()?.unix_timestamp;
        Ok(Self {
            publisher,
            install_vault: params.install_vault,
            master_metadata,
            master_mint,
            install_authority: params.install_authority,
            curator: params.curator.map(|pubkey| CuratorStatus {
                pubkey,
                verified: false,
            }),
            uri: params.uri.clone(),
            mint_seed_name: seed_name,
            kind,
            tag: params.tag.clone(),
            supply: params.supply,
            total_installs: 0,
            install_price: params.install_price,
            created_ts: now,
            updated_ts: now,
            total_rating: 0,
            num_ratings: 0,
            suspended: false,
            bump: [bump],
            _reserved0: [0; 64],
            _reserved1: [0; 24],
            _reserved2: [0; 9],
        })
    }

    pub fn as_seeds(&self) -> [&[u8]; 3] {
        ["xnft".as_bytes(), self.master_mint.as_ref(), &self.bump]
    }

    pub fn verify_install_authority(&self, pk: &Pubkey) -> Result<()> {
        if let Some(key) = self.install_authority {
            if key != *pk {
                return Err(error!(CustomError::InstallAuthorityMismatch));
            }
        }
        Ok(())
    }

    pub fn verify_supply(&self) -> anchor_lang::Result<()> {
        if let Some(supply) = self.supply {
            if supply > 0 && self.total_installs >= supply {
                return Err(error!(CustomError::InstallExceedsSupply));
            }
        }
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CuratorStatus {
    /// The pubkey of the `Curator` program account (32).
    pub pubkey: Pubkey,
    /// Whether the curator's authority has verified the assignment (1).
    pub verified: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum Kind {
    App,
    Collection,
    Nft,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum Tag {
    None,
    Defi,
    Game,
    Nfts,
}

#[cfg(test)]
mod tests {
    use anchor_lang::prelude::Pubkey;
    use std::str::FromStr;

    use super::*;
    use crate::CustomError;

    #[test]
    fn account_size_matches() {
        assert_eq!(Xnft::LEN, 598);
    }

    #[test]
    fn install_authority_checks() {
        let mut x = Xnft {
            publisher: Default::default(),
            install_vault: Default::default(),
            master_metadata: Default::default(),
            master_mint: Default::default(),
            install_authority: None,
            bump: Default::default(),
            kind: Kind::App,
            tag: Tag::None,
            uri: Default::default(),
            mint_seed_name: None,
            total_installs: Default::default(),
            install_price: Default::default(),
            created_ts: Default::default(),
            updated_ts: Default::default(),
            suspended: Default::default(),
            total_rating: Default::default(),
            num_ratings: Default::default(),
            supply: None,
            curator: None,
            _reserved0: [0; 64],
            _reserved1: [0; 24],
            _reserved2: [0; 9],
        };

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
        let mut x = Xnft {
            publisher: Default::default(),
            install_vault: Default::default(),
            master_metadata: Default::default(),
            master_mint: Default::default(),
            install_authority: None,
            bump: Default::default(),
            kind: Kind::App,
            tag: Tag::None,
            uri: Default::default(),
            mint_seed_name: None,
            total_installs: Default::default(),
            install_price: Default::default(),
            created_ts: Default::default(),
            updated_ts: Default::default(),
            suspended: Default::default(),
            total_rating: Default::default(),
            num_ratings: Default::default(),
            supply: None,
            curator: None,
            _reserved0: [0; 64],
            _reserved1: [0; 24],
            _reserved2: [0; 9],
        };

        assert!(x.verify_supply().is_ok());

        x.supply = Some(1);
        x.total_installs = 1;
        assert_eq!(
            x.verify_supply().unwrap_err(),
            anchor_lang::error::Error::from(CustomError::InstallExceedsSupply),
        );
    }
}
