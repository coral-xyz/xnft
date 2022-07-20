use anchor_lang::prelude::*;
use anchor_spl::metadata::{self, CreateMasterEditionV3, CreateMetadataAccountsV2, Metadata};
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
use mpl_token_metadata::state::DataV2;

use crate::state::Xnft2;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateXnft<'info> {
    pub metadata_program: Program<'info, Metadata>,

    ////////////////////////////////////////////////////////////////////////////
    // Auto derived below.
    ////////////////////////////////////////////////////////////////////////////
    #[account(
        init,
        payer = payer,
        seeds = [
            "mint".as_bytes(),
            publisher.key().as_ref(),
            name.as_bytes(),
        ],
        bump,
        mint::authority = xnft,
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
        token::authority = xnft,
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
        space = 8 + Xnft2::LEN,
        seeds = [
            "xnft".as_bytes(),
            master_edition.key().as_ref(),
        ],
        bump,
    )]
    pub xnft: Account<'info, Xnft2>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub publisher: Signer<'info>,

    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

impl<'info> CreateXnft<'info> {
    pub fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = MintTo {
            mint: self.master_mint.to_account_info(),
            to: self.master_token.to_account_info(),
            authority: self.xnft.to_account_info(),
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
            mint_authority: self.xnft.to_account_info(),
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
            mint_authority: self.xnft.to_account_info(), // todo: try xnft account
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
    uri: String,
    seller_fee_basis_points: u16,
    install_price: u64,
    install_vault: Pubkey,
) -> Result<()> {
    let xnft_bump = *ctx.bumps.get("xnft").unwrap();

    //
    // Mint the master token.
    //
    token::mint_to(
        ctx.accounts.mint_to_ctx().with_signer(&[&[
            "xnft".as_bytes(),
            ctx.accounts.master_edition.key().as_ref(),
            &[xnft_bump],
        ]]),
        1,
    )?;

    //
    // Create metadata.
    //
    let is_mutable = true;
    metadata::create_metadata_accounts_v2(
        ctx.accounts.create_metadata_accounts_ctx().with_signer(&[&[
            "xnft".as_bytes(),
            ctx.accounts.master_edition.key().as_ref(),
            &[xnft_bump],
        ]]),
        DataV2 {
            name: name.clone(),
            symbol,
            uri,
            seller_fee_basis_points,
            creators: None,   // todo
            collection: None, // todo
            uses: None,       //
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
        Some(0),
    )?;

    //
    // Initialize xNFT.
    //
    let clock = Clock::get()?;
    let xnft = &mut ctx.accounts.xnft;
    xnft.created_ts = clock.unix_timestamp;
    xnft.updated_ts = clock.unix_timestamp;
    xnft.install_price = install_price;
    xnft.install_vault = install_vault;
    xnft.name = name;
    xnft.publisher = ctx.accounts.publisher.key();
    xnft.authority = ctx.accounts.publisher.key();
    xnft.master_edition = ctx.accounts.master_edition.key();
    xnft.master_metadata = ctx.accounts.master_metadata.key();
    xnft.master_mint = ctx.accounts.master_mint.key();
    xnft.bump = xnft_bump;
    xnft.suspended = false;

    Ok(())
}
