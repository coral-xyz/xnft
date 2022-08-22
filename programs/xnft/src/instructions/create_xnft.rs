use anchor_lang::prelude::*;
use anchor_spl::metadata::{
    self, CreateMasterEditionV3, CreateMetadataAccountsV3, Metadata, SetCollectionSize,
};
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
use mpl_token_metadata::state::DataV2;

use crate::state::{ControlAuthority, Kind, Tag, Xnft};
use crate::CustomError;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateXnft<'info> {
    #[account(
        init,
        payer = payer,
        seeds = [
            "mint".as_bytes(),
            publisher.key().as_ref(),
            name.as_bytes(),
        ],
        bump,
        mint::authority = control_authority,
        mint::freeze_authority = control_authority,
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
        token::authority = control_authority,
        token::mint = master_mint,
    )]
    pub master_token: Account<'info, TokenAccount>,

    /// CHECK: Account allocation and initialization is done via CPI to the metadata program.
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

    /// CHECK: Account allocation and initialization is done via CPI to the metadata program.
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
        space = Xnft::LEN,
        seeds = [
            "xnft".as_bytes(),
            master_edition.key().as_ref(),
        ],
        bump,
    )]
    pub xnft: Account<'info, Xnft>,

    #[account(
        seeds = [
            "authority".as_bytes(),
        ],
        bump = control_authority.bump,
    )]
    pub control_authority: Box<Account<'info, ControlAuthority>>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub publisher: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> CreateXnft<'info> {
    pub fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = MintTo {
            mint: self.master_mint.to_account_info(),
            to: self.master_token.to_account_info(),
            authority: self.control_authority.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn set_collection_size_ctx(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, SetCollectionSize<'info>> {
        let program = self.metadata_program.to_account_info();
        let accounts = SetCollectionSize {
            metadata: self.master_metadata.to_account_info(),
            mint: self.master_mint.to_account_info(),
            update_authority: self.control_authority.to_account_info(),
            system_program: self.system_program.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn create_metadata_accounts_ctx(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, CreateMetadataAccountsV3<'info>> {
        let program = self.metadata_program.to_account_info();
        let accounts = CreateMetadataAccountsV3 {
            metadata: self.master_metadata.to_account_info(),
            mint: self.master_mint.to_account_info(),
            mint_authority: self.control_authority.to_account_info(),
            payer: self.payer.to_account_info(),
            update_authority: self.control_authority.to_account_info(),
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
            update_authority: self.control_authority.to_account_info(),
            mint_authority: self.control_authority.to_account_info(), // todo: try xnft account
            payer: self.payer.to_account_info(),
            metadata: self.master_metadata.to_account_info(),
            token_program: self.token_program.to_account_info(),
            system_program: self.system_program.to_account_info(),
            rent: self.rent.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}

pub fn create_xnft_handler(
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
    let authority_bump = ctx.accounts.control_authority.bump.clone();
    let xnft_bump = *ctx.bumps.get("xnft").unwrap();

    if name.len() > Xnft::MAX_NAME_LEN {
        return Err(error!(CustomError::NameTooLong));
    }

    //
    // Mint the master token.
    //
    token::mint_to(
        ctx.accounts.mint_to_ctx().with_signer(&[&[
            "authority".as_bytes(),
            &[authority_bump],
            // "xnft".as_bytes(),
            // ctx.accounts.master_edition.key().as_ref(),
            // &[xnft_bump],
        ]]),
        1,
    )?;

    //
    // Create metadata.
    //
    metadata::create_metadata_accounts_v3(
        ctx.accounts.create_metadata_accounts_ctx().with_signer(&[&[
            "authority".as_bytes(),
            &[authority_bump], // "xnft".as_bytes(),
                               // ctx.accounts.master_edition.key().as_ref(),
                               // &[xnft_bump],
        ]]),
        DataV2 {
            name: name.clone(),
            symbol,
            uri,
            seller_fee_basis_points,
            creators: None,   // TODO:
            collection: None, // TODO:
            uses: None,       // TODO:
        },
        true,
        true,
        None, // NOTE: mpl's current program sets the size to 0 regardless of provided value, must be done with set_collection_size
    )?;

    if let Some(sup) = supply {
        metadata::set_collection_size(
            ctx.accounts.set_collection_size_ctx().with_signer(&[&[
                "authority".as_bytes(),
                &[authority_bump],
                // "xnft".as_bytes(),
                // ctx.accounts.master_edition.key().as_ref(),
                // &[xnft_bump],
            ]]),
            None, // TODO:
            sup,
        )?;
    }

    //
    // Create master edition.
    //
    metadata::create_master_edition_v3(
        ctx.accounts.create_master_edition_v3_ctx().with_signer(&[&[
            "authority".as_bytes(),
            &[authority_bump],
            // "xnft".as_bytes(),
            // ctx.accounts.master_edition.key().as_ref(),
            // &[xnft_bump],
        ]]),
        Some(0),
    )?;

    //
    // Initialize xNFT.
    //
    let clock = Clock::get()?;
    let xnft = &mut ctx.accounts.xnft;

    xnft.authority = ctx.accounts.publisher.key();
    xnft.publisher = ctx.accounts.publisher.key();
    xnft.install_vault = install_vault;
    xnft.master_edition = ctx.accounts.master_edition.key();
    xnft.master_metadata = ctx.accounts.master_metadata.key();
    xnft.master_mint = ctx.accounts.master_mint.key();
    xnft.install_authority = None;
    xnft.bump = xnft_bump;
    xnft.kind = kind;
    xnft.tag = tag;
    xnft.name = name;
    xnft.total_installs = 0;
    xnft.install_price = install_price;
    xnft.created_ts = clock.unix_timestamp;
    xnft.updated_ts = clock.unix_timestamp;
    xnft.suspended = false;

    Ok(())
}
