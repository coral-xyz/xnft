use anchor_lang::prelude::*;
use anchor_spl::metadata::{self, Metadata, MetadataAccount, UpdateMetadataAccountsV2};
use mpl_token_metadata::state::DataV2;

use crate::state::{Tag, Xnft};
use crate::CustomError;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateParams {
    install_vault: Option<Pubkey>,
    name: Option<String>,
    price: Option<u64>,
    tag: Option<Tag>,
    uri: Option<String>,
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

pub fn update_xnft_handler(ctx: Context<UpdateXnft>, updates: UpdateParams) -> Result<()> {
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

    let clock = Clock::get()?;
    let xnft = &mut ctx.accounts.xnft;

    if let Some(vault) = updates.install_vault {
        xnft.install_vault = vault;
    }

    if let Some(name) = updates.name {
        if name.len() > Xnft::MAX_NAME_LEN {
            return Err(error!(CustomError::NameTooLong));
        }

        xnft.name = name;
    }

    if let Some(price) = updates.price {
        xnft.install_price = price;
    }

    if let Some(t) = updates.tag {
        xnft.tag = t;
    }

    xnft.updated_ts = clock.unix_timestamp;

    Ok(())
}
