// Copyright (C) 2022 Blue Coral, Inc.

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
