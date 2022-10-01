// Copyright (C) 2022 Blue Coral, Inc.

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
