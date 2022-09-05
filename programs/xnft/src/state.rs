use anchor_lang::prelude::*;

use crate::MAX_NAME_LEN;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum Kind {
    App,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum L1 {
    Solana,
    Ethereum,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum Tag {
    None,
    Defi,
    Game,
    Nft,
}

#[account]
pub struct Xnft {
    pub authority: Pubkey,
    pub publisher: Pubkey,
    pub install_vault: Pubkey,
    pub master_edition: Pubkey,
    pub master_metadata: Pubkey,
    pub master_mint: Pubkey,
    pub install_authority: Option<Pubkey>,
    pub bump: u8,
    pub kind: Kind,
    pub tag: Tag,
    pub name: String,
    pub total_installs: u64,
    pub install_price: u64,
    pub created_ts: i64,
    pub updated_ts: i64,
    pub suspended: bool,
    pub total_rating: u64,
    pub num_ratings: u32,
    pub l1: L1,
    _reserved: [u8; 19],
}

impl Xnft {
    pub const LEN: usize =
        8 + (32 * 6) + 33 + 8 + 1 + 1 + MAX_NAME_LEN + (8 * 4) + 1 + 8 + 4 + 1 + 19;
}

#[account]
pub struct Install {
    pub authority: Pubkey,
    pub xnft: Pubkey,
    pub master_metadata: Pubkey,
    pub edition: u64,
    _reserved: [u8; 64],
}

impl Install {
    pub const LEN: usize = 8 + (32 * 3) + 8 + 64;
}

#[account]
pub struct Review {
    pub author: Pubkey,
    pub xnft: Pubkey,
    pub rating: u8,
    pub uri: String,
    _reserved: [u8; 32],
}

impl Review {
    pub fn len(uri: String) -> usize {
        8 + 32 + 32 + 1 + (4 + uri.len()) + 32
    }
}

#[account]
pub struct Listing {
    pub authority: Pubkey,
    pub xnft: Pubkey,
    pub price: u64,
    pub bump: u8,
    _reserved: [u8; 64],
}

impl Listing {
    pub const LEN: usize = 8 + (32 * 2) + 8 + 1 + 64;
}
