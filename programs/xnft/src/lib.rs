use anchor_lang::prelude::*;

mod instructions;
mod state;

use instructions::*;

declare_id!("xnftkTnW8pdgkzyGcF8bb3WCMoBeU4r4d8JbKbv6MhW");

#[program]
pub mod xnft {
    use super::*;

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
        uri: String,
        seller_fee_basis_points: u16,
        install_price: u64,
        install_vault: Pubkey,
    ) -> Result<()> {
        instructions::create_xnft_handler(
            ctx,
            name,
            symbol,
            uri,
            seller_fee_basis_points,
            install_price,
            install_vault,
        )
    }

    /// Updates the code of an xNFT.
    ///
    /// This is simply a token metadata update cpi.
    pub fn update_xnft(ctx: Context<UpdateXnft>) -> Result<()> {
        instructions::update_xnft(ctx)
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
    #[msg("Attempting to install a currently suspended xNFT")]
    SuspendedInstallation,
}
