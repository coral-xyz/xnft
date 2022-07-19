use anchor_lang::prelude::*;
use anchor_lang::solana_program::{self, system_instruction};
use anchor_spl::metadata::{self, CreateMasterEditionV3, CreateMetadataAccountsV2, Metadata};
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
use mpl_token_metadata::state::DataV2;

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

    /// Updates the code of an xNFT.
    ///
    /// This is simply a token metadata update cpi.
    pub fn update_xnft(_ctx: Context<UpdateXnft>) -> Result<()> {
        // todo
        Ok(())
    }

    /// Creates an "installation" of an xNFT.
    ///
    /// Installation is just a synonym for minting an xNFT edition for a given
    /// user.
    pub fn create_install(ctx: Context<CreateInstall>) -> Result<()> {
        let xnft = &mut ctx.accounts.xnft;
        let install = &mut ctx.accounts.install;

        //
        // Pay to install the xNFT, if needed.
        //
        if xnft.install_price > 0 {
            solana_program::program::invoke(
                &system_instruction::transfer(
                    &ctx.accounts.authority.key(),
                    &ctx.accounts.install_vault.key(),
                    xnft.install_price,
                ),
                &[
                    ctx.accounts.authority.to_account_info(),
                    ctx.accounts.install_vault.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
            )?;
        }

        //
        // Initialize the install data.
        //
        install.xnft = xnft.key();
        install.id = xnft.total_installs;
        install.authority = ctx.accounts.authority.key();
        install.master_metadata = xnft.master_metadata;

        //
        // Track aggregate xnft metrics.
        //
        xnft.total_installs += 1;

        Ok(())
    }

    /// Variant of `create_xnft_installation` where the install authority is
    /// required to sign.
    pub fn create_install_with_authority(_ctx: Context<CreateInstallWithAuthority>) -> Result<()> {
        // todo
        Ok(())
    }

    /// Closes the install account.
    pub fn delete_install(_ctx: Context<DeleteInstall>) -> Result<()> {
        // todo
        Ok(())
    }

    /// Sets the install suspension flag on the xnft.
    pub fn set_suspended(ctx: Context<SetSuspended>, flag: bool) -> Result<()> {
        let xnft = &mut ctx.accounts.xnft;
        xnft.suspended = flag;
        Ok(())
    }
}

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

#[derive(Accounts)]
pub struct UpdateXnft {
    // todo
}

#[derive(Accounts)]
pub struct CreateInstall<'info> {
    #[account(
        mut,
        has_one = install_vault,
        constraint = xnft.install_authority == None,
        constraint = !xnft.suspended @ CustomError::SuspendedInstallation,
    )]
    pub xnft: Account<'info, Xnft2>,

    ////////////////////////////////////////////////////////////////////////////
    // Auto derived below.
    ////////////////////////////////////////////////////////////////////////////
    #[account(
        init,
        payer = authority,
        space = Install::LEN,
        seeds = [
            "install".as_bytes(),
            authority.key().as_ref(),
            xnft.key().as_ref(),
        ],
        bump,
    )]
    pub install: Account<'info, Install>,
    /// CHECK: xnft has_one constraint.
    pub install_vault: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateInstallWithAuthority<'info> {
    #[account(
        mut,
        constraint = xnft.install_authority == Some(install_authority.key()),
        constraint = !xnft.suspended @ CustomError::SuspendedInstallation,
    )]
    pub xnft: Account<'info, Xnft2>,

    ////////////////////////////////////////////////////////////////////////////
    // Auto derived below.
    ////////////////////////////////////////////////////////////////////////////
    #[account(
        init,
        payer = authority,
        space = Install::LEN,
        seeds = [
            "install".as_bytes(),
            authority.key().as_ref(),
        ],
        bump,
    )]
    pub install: Account<'info, Install>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub install_authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateInstallWithSubscription {
    // todo
}

#[derive(Accounts)]
pub struct DeleteInstall {
    // todo
}

#[derive(Accounts)]
pub struct SetSuspended<'info> {
    #[account(
        mut,
        has_one = authority,
    )]
    pub xnft: Account<'info, Xnft2>,

    pub authority: Signer<'info>,
}

#[account]
pub struct Xnft2 {
    authority: Pubkey,
    publisher: Pubkey,
    kind: Kind,
    //
    // Total amount of installs circulating.
    //
    total_installs: u64,
    //
    // The amount one must pay to install in lamports. If zero, it's free.
    //
    install_price: u64,
    //
    // The vault that will receive install revenue.
    //
    install_vault: Pubkey,
    //
    // Token metadata for the underlying NFT.
    //
    master_edition: Pubkey,
    master_metadata: Pubkey,
    master_mint: Pubkey,
    //
    // If present, this key must sign off on all installs.
    //
    bump: u8,
    created_ts: i64,
    updated_ts: i64,
    install_authority: Option<Pubkey>,
    name: String,
    //
    // Flag to mark xnft as suspending further installs.
    //
    suspended: bool,
}

#[account]
pub struct Install {
    authority: Pubkey,
    xnft: Pubkey,
    id: u64,
    //
    // Token metadata for the underlying NFT.
    //
    master_metadata: Pubkey,
}

impl Install {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 32;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum Kind {
    Table,
    Image,
}

impl Xnft2 {
    pub const LEN: usize =
        8 + 8 + 100 + 32 + 32 + 8 + 8 + 32 + 8 + 32 + 32 + 32 + 32 + 8 + 32 + 32 + 1;
}

#[error_code]
pub enum CustomError {
    #[msg("Attempting to install a currently suspended xNFT")]
    SuspendedInstallation,
}
