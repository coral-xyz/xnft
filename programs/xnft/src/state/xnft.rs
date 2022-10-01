// Copyright (C) 2022 Blue Coral, Inc.

use anchor_lang::prelude::*;

use super::{Kind, Tag, L1};
use crate::{CustomError, MAX_NAME_LEN};

#[account]
pub struct Xnft {
    /// The pubkey of the original xNFT creator (32).
    pub publisher: Pubkey,
    /// The pubkey of the account to receive install payments (32).
    pub install_vault: Pubkey,
    /// The pubkey of the ML master edition account (32).
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
    /// Unused reserved byte space for additive future changes.
    pub _reserved: [u8; 64],
}

impl Xnft {
    pub const LEN: usize =
        8 + (32 * 5) + 33 + 1 + 1 + 1 + MAX_NAME_LEN + (8 * 4) + 1 + 8 + 4 + 1 + 9 + 64;

    pub fn check_supply(&self) -> anchor_lang::Result<()> {
        if let Some(supply) = self.supply {
            if supply > 0 && self.total_installs >= supply {
                return Err(error!(CustomError::InstallExceedsSupply));
            }
        }
        Ok(())
    }

    pub fn verify_install_authority(&self, pubkey: &Pubkey) -> anchor_lang::Result<()> {
        if let Some(auth) = self.install_authority {
            if auth != *pubkey {
                return Err(error!(CustomError::InstallAuthorityMismatch));
            }
        }
        Ok(())
    }
}