//! xNFTs are an extension to the metaplex NFT standard on Solana facilitating
//! the creation of *executable* NFTs. That is, NFTs with an associated Coral
//! UI react bundle that can be safely interpreted inside the Coral UI web
//! renderer.
//!
//! The architecture is simple. All xNFT creation and modification goes through
//! this program--including all interactions with the metaplex metadata program.
//! It works as follows.
//!
//! An xNFT definition consists of multiple accounts. First we have the standard
//! metaplex metadata accounts:
//!
//! - Master SPL token mint.
//! - Master Metaplex token metadata PDA associated with the master mint.
//! - Master Edition PDA associated with the master mint.
//!
//! And an additional xNFT specific account:
//!
//! - xNFT PDA associated with all of the above.
//!
//! The accounts above define an xNFT, and are controlled by an optional xNFT
//! authority, but do not define ownership over a given "installation". (Note:
//! we use the term "install" in the same way metaplex uses hte term "print.")
//!
//! Unlike metaplex NFTs, we do not recommend the usage of xNFTs without limited
//! editions. Even if creating a 1 of 1 collection, we recommend to always
//! "print" a limited edition associated with the master edition, for the
//! sake of consistency in client code.
//!
//! To create a given xNFT "installation", one should always have a
//!
//! - Edition mint defining the installation token.
//! - Edition token account defining a wallet's ownership.
//! - Edition PDA associated with the mint, defining the install of an xNFT.
//!
//! To update xNFT code, one only need to update the meta.
//!
//! We define an xNFT PDA that stores all the met
use anchor_lang::prelude::*;
use anchor_spl::metadata::{self, CreateMasterEditionV3, CreateMetadataAccountsV2, Metadata};
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
use mpl_token_metadata::state::DataV2;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

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
    ) -> Result<()> {
        //
        // Mint the master token.
        //
        token::mint_to(ctx.accounts.mint_to_ctx(), 1)?;

        //
        // Create metadata.
        //
        let xnft_bump = *ctx.bumps.get("xnft").unwrap();
        let is_mutable = true;
        metadata::create_metadata_accounts_v2(
            ctx.accounts.create_metadata_accounts_ctx().with_signer(&[&[
                "xnft".as_bytes(),
                ctx.accounts.master_edition.key().as_ref(),
                &[xnft_bump],
            ]]),
            DataV2 {
                name,
                symbol,
                uri,
                seller_fee_basis_points,
                creators: None,   // todo
                collection: None, // todo
                uses: None,
            },
            is_mutable,
        )?;

        //
        // Create master edition.
        //
        metadata::create_master_edition_v3(
            ctx.accounts.create_master_edition_v3_ctx().with_signer(&[&[
                "xnft".as_bytes(),
                ctx.accounts.master_edition.key().as_ref(),
                &[xnft_bump],
            ]]),
            None,
        )?;

        //
        // Initialize xNFT.
        //
        let xnft = &mut ctx.accounts.xnft;
        xnft.authority = ctx.accounts.authority.key();
        xnft.master_edition = ctx.accounts.master_edition.key();
        xnft.master_metadata = ctx.accounts.master_metadata.key();
        xnft.master_mint = ctx.accounts.master_mint.key();
        xnft.bump = xnft_bump;

        Ok(())
    }

    /// Updates the code of an xNFT.
    ///
    /// This is simply a token metadata update cpi.
    pub fn update_xnft(ctx: Context<UpdateXnft>) -> Result<()> {
        // todo
        //
        // cpi: update metadata
        //
        Ok(())
    }

    /// Creates an "installation" of an xNFT.
    ///
    /// Installation is just a synonym for minting an xNFT edition for a given
    /// user.
    pub fn create_xnft_installation(ctx: Context<CreateXnftInstallation>) -> Result<()> {
        // todo
        //
        // cpi: create edition
        //      note: the master edition's mint's single token's owner needs to
        //            sign this transaction to create a limited edition.
        //
        //
        Ok(())
    }

    /// Variant of `create-xnft_installation` where the install authority is
    /// required to sign.
    pub fn create_xnft_installation_with_authority(
        ctx: Context<CreateXnftInstallationWithAuthority>,
    ) -> Result<()> {
        // todo
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateXnft<'info> {
    #[account(
				init,
				payer = payer,
				seeds = [
						"mint".as_bytes(),
						authority.key().as_ref(),
				],
				bump,
				mint::authority = authority,
				mint::decimals = 0,
		)]
    pub master_mint: Account<'info, Mint>,
    #[account(
				init,
				payer = payer,
				seeds = [
						"token".as_bytes(),
						master_mint.key().as_ref(),
				],
				bump,
				token::authority = authority,
				token::mint = master_mint,
		)]
    pub master_token: Account<'info, TokenAccount>,
    /// CHECK: Account allocation and initialization is done via CPI to the
    ///        metadata program.
    #[account(
				mut,
				seeds = [
						"metadata".as_bytes(),
						metadata_program.key().as_ref(),
						master_mint.key().as_ref(),
				],
				seeds::program = metadata_program.key(),
				bump,
		)]
    pub master_metadata: UncheckedAccount<'info>,
    /// CHECK: Account allocation and initialization is done via CPI to the
    ///        metadata program.
    #[account(
				mut,
				seeds = [
						"metadata".as_bytes(),
						metadata_program.key().as_ref(),
						master_mint.key().as_ref(),
						"edition".as_bytes(),
				],
				seeds::program = metadata_program.key(),
				bump,
		)]
    pub master_edition: UncheckedAccount<'info>,
    #[account(
				init,
				payer = payer,
				space = 8 + Xnft::LEN,
				seeds = [
						"xnft".as_bytes(),
						master_edition.key().as_ref(),
				],
				bump,
		)]
    pub xnft: Account<'info, Xnft>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub authority: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub metadata_program: Program<'info, Metadata>,
}

impl<'info> CreateXnft<'info> {
    pub fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = MintTo {
            mint: self.master_mint.to_account_info(),
            to: self.master_token.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn create_metadata_accounts_ctx(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, CreateMetadataAccountsV2<'info>> {
        let program = self.metadata_program.to_account_info();
        let accounts = CreateMetadataAccountsV2 {
            metadata: self.master_metadata.to_account_info(),
            mint: self.master_mint.to_account_info(),
            mint_authority: self.payer.to_account_info(),
            payer: self.payer.to_account_info(),
            update_authority: self.xnft.to_account_info(),
            system_program: self.system_program.to_account_info(),
            rent: self.rent.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn create_master_edition_v3_ctx(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, CreateMasterEditionV3<'info>> {
        let program = self.metadata_program.to_account_info();
        let accounts = CreateMasterEditionV3 {
            edition: self.master_edition.to_account_info(),
            mint: self.master_mint.to_account_info(),
            update_authority: self.xnft.to_account_info(),
            mint_authority: self.payer.to_account_info(), // todo: try xnft account
            payer: self.payer.to_account_info(),
            metadata: self.master_metadata.to_account_info(),
            token_program: self.token_program.to_account_info(),
            system_program: self.system_program.to_account_info(),
            rent: self.rent.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}

#[derive(Accounts)]
pub struct UpdateXnft {
    // todo
}

#[derive(Accounts)]
pub struct CreateXnftInstallation {
    // todo
//
// assert the install authority is none here
}

#[derive(Accounts)]
pub struct CreateXnftInstallationWithAuthority {
    // todo
//
// asert the install authority is some and signed here
}

#[account]
pub struct Xnft {
    kind: Kind,
    name: String,
    authority: Pubkey,
    master_edition: Pubkey,
    master_metadata: Pubkey,
    master_mint: Pubkey,
    //
    // If present, this key must sign off on all installs.
    //
    install_authority: Option<Pubkey>,
    bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum Kind {
    Table,
    Image,
}

impl Xnft {
    pub const LEN: usize = 8 + 8 + 100 + 4 * 32;
}
