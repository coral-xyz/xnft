// xNFT Protocol
// Copyright (C) 2022 Blue Coral, Inc.
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along
// with this program; if not, write to the Free Software Foundation, Inc.,
// 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

use anchor_lang::prelude::*;

mod events;
mod instructions;
pub mod state;
mod util;

use instructions::*;

declare_id!("BaHSGaf883GA3u8qSC5wNigcXyaScJLSBJZbALWvPcjs");

#[constant]
pub const MAX_NAME_LEN: usize = 30;
#[constant]
pub const MAX_RATING: u8 = 5;

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
    #[allow(clippy::too_many_arguments)]
    pub fn create_xnft(
        ctx: Context<CreateXnft>,
        name: String,
        params: CreateXnftParams,
    ) -> Result<()> {
        instructions::create_xnft_handler(ctx, name, params)
    }

    /// Updates the code of an xNFT.
    ///
    /// This is simply a token metadata update cpi.
    pub fn update_xnft(ctx: Context<UpdateXnft>, updates: UpdateParams) -> Result<()> {
        instructions::update_xnft_handler(ctx, updates)
    }

    /// Creates a "review" of an xNFT containing a URI to a comment and a 0-5 rating.
    pub fn create_review(ctx: Context<CreateReview>, uri: String, rating: u8) -> Result<()> {
        instructions::create_review_handler(ctx, uri, rating)
    }

    /// Creates an "installation" of an xNFT.
    ///
    /// Installation is just a synonym for minting an xNFT edition for a given
    /// user.
    pub fn create_install(ctx: Context<CreateInstall>) -> Result<()> {
        instructions::create_install_handler(ctx)
    }

    /// Creates an "installation" of a private xNFT through prior access approval
    /// granted by the xNFT's installation authority.
    pub fn create_permissioned_install(ctx: Context<CreatePermissionedInstall>) -> Result<()> {
        instructions::create_permissioned_install_handler(ctx)
    }

    /// Closes the install account.
    pub fn delete_install(ctx: Context<DeleteInstall>) -> Result<()> {
        instructions::delete_install_handler(ctx)
    }

    /// Closes the review account and removes metrics from xNFT account.
    pub fn delete_review(ctx: Context<DeleteReview>) -> Result<()> {
        instructions::delete_review_handler(ctx)
    }

    /// Sets the install suspension flag on the xnft.
    pub fn set_suspended(ctx: Context<SetSuspended>, flag: bool) -> Result<()> {
        instructions::set_suspended_handler(ctx, flag)
    }

    /// Creates an access program account that indicates a wallet's
    /// access permission to install a private xNFT.
    pub fn grant_access(ctx: Context<GrantAccess>) -> Result<()> {
        instructions::grant_access_handler(ctx)
    }

    /// Closes the access program account for a given wallet on a private xNFT,
    /// effectively revoking their permission to create installations of the xNFT.
    pub fn revoke_access(ctx: Context<RevokeAccess>) -> Result<()> {
        instructions::revoke_access_handler(ctx)
    }
}

#[error_code]
pub enum CustomError {
    #[msg("You cannot create a review for an xNFT that you currently own or published")]
    CannotReviewOwned,

    #[msg("A collection pubkey was provided without the collection Kind variant")]
    CollectionWithoutKind,

    #[msg("The provided xNFT install authority did not match")]
    InstallAuthorityMismatch,

    #[msg("The asserted authority/owner did not match that of the Install account")]
    InstallOwnerMismatch,

    #[msg("The max supply has been reached for the xNFT.")]
    InstallExceedsSupply,

    #[msg("The name provided for creating the xNFT exceeded the byte limit")]
    NameTooLong,

    #[msg("The rating for a review must be between 0 and 5")]
    RatingOutOfBounds,

    #[msg("The installation provided for the review does not match the xNFT")]
    ReviewInstallMismatch,

    #[msg("Attempting to install a currently suspended xNFT")]
    SuspendedInstallation,

    #[msg("The access account provided is not associated with the wallet")]
    UnauthorizedInstall,
}
