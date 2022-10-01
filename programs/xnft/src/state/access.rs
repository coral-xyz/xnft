// Copyright (C) 2022 Blue Coral, Inc.

use anchor_lang::prelude::*;

#[account]
pub struct Access {
    pub wallet: Pubkey,
    pub xnft: Pubkey,
    pub bump: u8,
    pub _reserved: [u8; 32],
}

impl Access {
    pub const LEN: usize = 8 + (32 * 2) + 1 + 32;
}
