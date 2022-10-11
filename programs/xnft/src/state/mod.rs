// Copyright (C) 2022 Blue Coral, Inc.

use anchor_lang::prelude::*;

mod access;
mod install;
mod review;
mod xnft;

pub use access::*;
pub use install::*;
pub use review::*;
pub use xnft::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum Kind {
    App,
    Collection,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum L1 {
    Solana,
    Ethereum,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum Tag {
    None,
    Defi,
    Game,
    Nft,
}
