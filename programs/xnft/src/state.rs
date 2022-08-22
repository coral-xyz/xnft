use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum Kind {
    App,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum Tag {
    None,
    Defi,
    Game,
    Nft,
}

#[account]
pub struct ControlAuthority {
    pub bump: u8,
}

impl ControlAuthority {
    pub const LEN: usize = 8 + 1;
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
    _reserved: [u8; 32],
}

impl Xnft {
    pub const MAX_NAME_LEN: usize = 30;
    pub const LEN: usize = 8 + (32 * 6) + 33 + 8 + 1 + 1 + Self::MAX_NAME_LEN + (8 * 4) + 1 + 32;
}

#[account]
pub struct Install {
    pub authority: Pubkey,
    pub xnft: Pubkey,
    pub master_metadata: Pubkey,
    pub id: u64,
    _reserved: [u8; 64],
}

impl Install {
    pub const LEN: usize = 8 + (32 * 3) + 8 + 64;
}
