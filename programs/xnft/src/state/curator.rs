// Copyright (C) 2022 Blue Coral, Inc.

use anchor_lang::prelude::*;

#[account]
pub struct Curator {
    /// The owning authority of the curator (32).
    pub authority: Pubkey,
    /// Byte array representing the type of signature requirements for
    /// different xNFT lifecycle management operations create, update, and delete (3).
    pub signature_requirements: [bool; 3],
    /// The bump nonce for the account's derivation (1).
    pub bump: u8,
    /// Reserved byte space for additive future changes (64).
    pub _reserved: [u8; 64],
}

impl Curator {
    pub const LEN: usize = 8 + 32 + 3 + 1 + 64;
}
