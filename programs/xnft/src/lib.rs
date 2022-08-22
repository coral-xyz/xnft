use anchor_lang::prelude::*;

mod instructions;
mod state;

use instructions::*;
use state::{Kind, Tag};

declare_id!("BdbULx4sJSeLJzvR6h6QxL4fUPJAJw86qmwwXt6jBfXd");

#[program]
pub mod xnft {
    use super::*;

    /// Creates a program owned authority singleton to act as xNFT update and freeze authority.
    pub fn create_authority(ctx: Context<CreateAuthority>) -> Result<()> {
        instructions::create_authority_handler(ctx)
    }

    /// Creates all parts of an xNFT instance.
    ///
    /// * Master mint (supply 1).
    /// * Master token.
    /// * Master metadata PDA associated with the master mint.
    /// * Master edition PDA associated with the master mint.
    /// * xNFT PDA associated with the master edition.
    ///
    /// Once this is invoked, an xNFT exists and can be "installed" by users.
    pub fn create_xnft(
        ctx: Context<CreateXnft>,
        name: String,
        symbol: String,
        tag: Tag,
        kind: Kind,
        uri: String,
        seller_fee_basis_points: u16,
        install_price: u64,
        install_vault: Pubkey,
        supply: Option<u64>,
    ) -> Result<()> {
        instructions::create_xnft_handler(
            ctx,
            name,
            symbol,
            tag,
            kind,
            uri,
            seller_fee_basis_points,
            install_price,
            install_vault,
            supply,
        )
    }

    /// Updates the code of an xNFT.
    ///
    /// This is simply a token metadata update cpi.
    pub fn update_xnft(ctx: Context<UpdateXnft>, updates: UpdateParams) -> Result<()> {
        instructions::update_xnft_handler(ctx, updates)
    }

    /// Creates an "installation" of an xNFT.
    ///
    /// Installation is just a synonym for minting an xNFT edition for a given
    /// user.
    pub fn create_install(ctx: Context<CreateInstall>) -> Result<()> {
        instructions::create_install_handler(ctx)
    }

    /// Variant of `create_xnft_installation` where the install authority is
    /// required to sign.
    pub fn create_install_with_authority(ctx: Context<CreateInstallWithAuthority>) -> Result<()> {
        instructions::create_install_with_authority_handler(ctx)
    }

    /// Closes the install account.
    pub fn delete_install(ctx: Context<DeleteInstall>) -> Result<()> {
        instructions::delete_install_handler(ctx)
    }

    /// Sets the install suspension flag on the xnft.
    pub fn set_suspended(ctx: Context<SetSuspended>, flag: bool) -> Result<()> {
        instructions::set_suspended_handler(ctx, flag)
    }
}

#[error_code]
pub enum CustomError {
    #[msg("The name provided for creating the xNFT exceeded the byte limit")]
    NameTooLong,

    #[msg("Attempting to install a currently suspended xNFT")]
    SuspendedInstallation,
}
