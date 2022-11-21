# Auxiliary State Structures

```rust
pub enum Kind {
    App,
    Collection,
    Nft,
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
```
