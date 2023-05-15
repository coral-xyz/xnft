# Auxiliary State Structures

```rust
pub enum Kind {
    App,
    Collectible,
}

pub enum L1 {
    Solana,
    Ethereum,
}

pub enum Tag {
    None,
    Defi,
    Game,
    Nft,
}

pub struct CuratorStatus {
    /// The pubkey of the `Curator` program account (32).
    pub pubkey: Pubkey,
    /// Whether the curator's authority has verified the assignment (1).
    pub verified: bool,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreatorsParam {
    pub address: Pubkey,
    pub share: u8,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreateXnftParams {
    pub creators: Vec<CreatorsParam>,
    pub curator: Option<Pubkey>,           // Some("...") values are only relevant for Kind::App xNFTs
    pub install_authority: Option<Pubkey>, // Some("...") values are only relevant for Kind::App xNFTs
    pub install_price: u64,
    pub install_vault: Pubkey,
    pub seller_fee_basis_points: u16,
    pub supply: Option<u64>,               // Some("...") values are only relevant for Kind::App xNFTs
    pub symbol: String,
    pub tag: Tag,
    pub uri: String,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateParams {
    pub install_authority: Option<Pubkey>, // Some("...") values are only relevant for Kind::App xNFTs
                                           // Will remove any existing install authority is given `None`
    pub install_price: Option<u64>,        // Some("...") values are only relevant for Kind::App xNFTs
    pub install_vault: Option<Pubkey>,     // Some("...") values are only relevant for Kind::App xNFTs
    pub name: Option<String>,              // Some("...") values are only relevant for Kind::App xNFTs
    pub supply: Option<u64>,               // Some("...") values are only relevant for Kind::App xNFTs
    pub tag: Option<Tag>,
    pub uri: Option<String>,
}
```
