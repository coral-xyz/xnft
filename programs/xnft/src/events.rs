use anchor_lang::prelude::*;

#[event]
pub struct AccessGranted {
    pub wallet: Pubkey,
    pub xnft: Pubkey,
}

#[event]
pub struct InstallationCreated {
    pub installer: Pubkey,
    pub xnft: Pubkey,
}

#[event]
pub struct ReviewCreated {
    pub author: Pubkey,
    pub rating: u8,
    pub xnft: Pubkey,
}

#[event]
pub struct XnftUpdated {
    pub metadata_uri: String,
    pub xnft: Pubkey,
}
