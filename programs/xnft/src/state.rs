use anchor_lang::prelude::*;

#[account]
pub struct Xnft2 {
    pub authority: Pubkey,
    pub publisher: Pubkey,
    pub kind: Kind,
    //
    // Total amount of installs circulating.
    //
    pub total_installs: u64,
    //
    // The amount one must pay to install in lamports. If zero, it's free.
    //
    pub install_price: u64,
    //
    // The vault that will receive install revenue.
    //
    pub install_vault: Pubkey,
    //
    // Token metadata for the underlying NFT.
    //
    pub master_edition: Pubkey,
    pub master_metadata: Pubkey,
    pub master_mint: Pubkey,
    //
    // If present, this key must sign off on all installs.
    //
    pub bump: u8,
    pub created_ts: i64,
    pub updated_ts: i64,
    pub install_authority: Option<Pubkey>,
    pub name: String,
    //
    // Flag to mark xnft as suspending further installs.
    //
    pub suspended: bool,
}

impl Xnft2 {
    pub const LEN: usize =
        8 + 8 + 100 + 32 + 32 + 8 + 8 + 32 + 8 + 32 + 32 + 32 + 32 + 8 + 32 + 32 + 1;
}

#[account]
pub struct Install {
    pub authority: Pubkey,
    pub xnft: Pubkey,
    pub id: u64,
    //
    // Token metadata for the underlying NFT.
    //
    pub master_metadata: Pubkey,
}

impl Install {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 32;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum Kind {
    App,
    Image,
    Table,
}
