use anchor_lang::prelude::*;
use anchor_lang::solana_program::{self, system_instruction};
use anchor_spl::metadata::{
    self, CreateMasterEditionV3, CreateMetadataAccountsV3, Metadata, MetadataAccount,
    SetCollectionSize, UpdateMetadataAccountsV2,
};
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
use mpl_token_metadata::state::DataV2;

declare_id!("BdbULx4sJSeLJzvR6h6QxL4fUPJAJw86qmwwXt6jBfXd");

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
        tag: Tag,
        kind: Kind,
        uri: String,
        seller_fee_basis_points: u16,
        install_price: u64,
        install_vault: Pubkey,
        supply: Option<u64>,
    ) -> Result<()> {
        let xnft_bump = *ctx.bumps.get("xnft").unwrap();

        if name.len() > Xnft::MAX_NAME_LEN {
            return Err(error!(CustomError::NameTooLong));
        }

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
        let authority_is_signer = true;

        metadata::create_metadata_accounts_v3(
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
                creators: None,   // TODO:
                collection: None, // TODO:
                uses: None,       // TODO:
            },
            is_mutable,
            authority_is_signer,
            None, // NOTE: mpl's current program sets the size to 0 regardless of provided value, must be done with set_collection_size
        )?;

        if let Some(sup) = supply {
            metadata::set_collection_size(
                ctx.accounts.set_collection_size_ctx().with_signer(&[&[
                    "xnft".as_bytes(),
                    ctx.accounts.master_edition.key().as_ref(),
                    &[xnft_bump],
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
        xnft.bump = xnft_bump;
        xnft.kind = kind;
        xnft.tag = tag;
        xnft.name = name;
        xnft.publisher = ctx.accounts.publisher.key();
        xnft.authority = ctx.accounts.publisher.key();
        xnft.master_edition = ctx.accounts.master_edition.key();
        xnft.master_metadata = ctx.accounts.master_metadata.key();
        xnft.master_mint = ctx.accounts.master_mint.key();
        xnft.install_authority = None;
        xnft.total_installs = 0;
        xnft.install_price = install_price;
        xnft.install_vault = install_vault;
        xnft.created_ts = clock.unix_timestamp;
        xnft.updated_ts = clock.unix_timestamp;
        xnft.suspended = false;

        Ok(())
    }

    /// Updates the code of an xNFT.
    ///
    /// This is simply a token metadata update cpi.
    pub fn update_xnft(ctx: Context<UpdateXnft>, updates: UpdateParams) -> Result<()> {
        let md = &ctx.accounts.master_metadata;

        if let Some(u) = updates.uri {
            metadata::update_metadata_accounts_v2(
                ctx.accounts.update_metadata_accounts_ctx().with_signer(&[&[
                    "xnft".as_bytes(),
                    ctx.accounts.xnft.master_edition.as_ref(),
                    &[ctx.accounts.xnft.bump],
                ]]),
                None,
                Some(DataV2 {
                    name: ctx.accounts.xnft.name.clone(),
                    symbol: md.data.symbol.clone(),
                    uri: u,
                    seller_fee_basis_points: md.data.seller_fee_basis_points,
                    creators: None,   // TODO:
                    collection: None, // TODO:
                    uses: None,       // TODO:
                }),
                None,
                None,
            )?;
        }

        let xnft = &mut ctx.accounts.xnft;

        if let Some(vault) = updates.install_vault {
            xnft.install_vault = vault;
        }

        if let Some(price) = updates.price {
            xnft.install_price = price;
        }

        if let Some(t) = updates.tag {
            xnft.tag = t;
        }

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
        install.authority = ctx.accounts.authority.key();
        install.master_metadata = xnft.master_metadata;
        install.id = xnft.total_installs;

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
        space = Xnft::LEN,
        seeds = [
            "xnft".as_bytes(),
            master_edition.key().as_ref(),
        ],
        bump,
    )]
    pub xnft: Account<'info, Xnft>,
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

    pub fn set_collection_size_ctx(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, SetCollectionSize<'info>> {
        let program = self.metadata_program.to_account_info();
        let accounts = SetCollectionSize {
            metadata: self.master_metadata.to_account_info(),
            mint: self.master_mint.to_account_info(),
            update_authority: self.xnft.to_account_info(),
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
pub struct UpdateXnft<'info> {
    #[account(
        mut,
        has_one = authority,
        has_one = master_metadata,
    )]
    pub xnft: Account<'info, Xnft>,

    #[account(mut)]
    pub master_metadata: Account<'info, MetadataAccount>,

    pub authority: Signer<'info>,
    pub metadata_program: Program<'info, Metadata>,
}

impl<'info> UpdateXnft<'info> {
    pub fn update_metadata_accounts_ctx(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, UpdateMetadataAccountsV2<'info>> {
        let program = self.metadata_program.to_account_info();
        let accounts = UpdateMetadataAccountsV2 {
            metadata: self.master_metadata.to_account_info(),
            update_authority: self.xnft.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}

#[derive(Accounts)]
pub struct CreateInstall<'info> {
    #[account(
        mut,
        has_one = install_vault,
        constraint = xnft.install_authority == None,
        constraint = !xnft.suspended @ CustomError::SuspendedInstallation,
    )]
    pub xnft: Account<'info, Xnft>,

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
    pub xnft: Account<'info, Xnft>,

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
    #[account(mut)]
    pub authority: Signer<'info>,
    pub install_authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DeleteInstall<'info> {
    #[account(
        mut,
        close = receiver,
        has_one = authority,
    )]
    pub install: Account<'info, Install>,

    /// CHECK: the account receiving the rent doesn't need validation.
    #[account(mut)]
    pub receiver: UncheckedAccount<'info>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetSuspended<'info> {
    #[account(
        mut,
        has_one = authority,
    )]
    pub xnft: Account<'info, Xnft>,

    pub authority: Signer<'info>,
}

#[account]
pub struct Xnft {
    authority: Pubkey,
    publisher: Pubkey,
    install_vault: Pubkey,
    master_edition: Pubkey,
    master_metadata: Pubkey,
    master_mint: Pubkey,
    install_authority: Option<Pubkey>,
    bump: u8,
    kind: Kind,
    tag: Tag,
    name: String,
    total_installs: u64,
    install_price: u64,
    created_ts: i64,
    updated_ts: i64,
    suspended: bool,
    _reserved: [u8; 32],
}

impl Xnft {
    pub const MAX_NAME_LEN: usize = 30;
    pub const LEN: usize = 8 + (32 * 6) + 33 + 8 + 1 + 1 + Self::MAX_NAME_LEN + (8 * 4) + 1 + 32;
}

#[account]
pub struct Install {
    authority: Pubkey,
    xnft: Pubkey,
    master_metadata: Pubkey,
    id: u64,
    _reserved: [u8; 64],
}

impl Install {
    pub const LEN: usize = 8 + (32 * 3) + 8 + 64;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum Kind {
    App,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum Tag {
    None,
    Defi,
    Game,
    Nft,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateParams {
    install_vault: Option<Pubkey>,
    price: Option<u64>,
    tag: Option<Tag>,
    uri: Option<String>,
}

#[error_code]
pub enum CustomError {
    #[msg("The name provided for creating the xNFT exceeded the byte limit")]
    NameTooLong,

    #[msg("Attempting to install a currently suspended xNFT")]
    SuspendedInstallation,
}
