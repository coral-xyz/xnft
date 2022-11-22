# Create an xNFT

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/create_xnft.rs)

Create the xNFT and the supporting accounts required for meeting the MPL standard:

- Master mint
- Master token
- Master metadata
- Master edition

The uploading of the metadata JSON blob and associated files (bundle code, icons, screenshots, etc) must be handled prior to invoke this instruction such that the content URI(s) are available to provide as instruction arguments.

### MPL Standardization

- The master mint will mint a total supply of `1` to the master token account with the xNFT PDA being the authority of the mint
- The metadata account will be populated with the relevant values as providing in the instruction arguments and primary sale happened

!> Instead of creating a master edition and reliquishing freeze and mint authority, the freeze and mint authority of the master mint is given to the xNFT PDA. This accomplishes the same effect of ensuring a supply of `1` with programmatic signing requirements without surrendering the authority to an external program.

## Accounts

| Name                     | Signer | Writable | Description                                                  |
| :----------------------- | :----: | :------: | :----------------------------------------------------------- |
| Master Mint              |   ❌   |    ✅    | The master mint for the xNFT token to be initialized         |
| Master Token             |   ❌   |    ✅    | The master token account for the xNFT mint to be initialized |
| Master Metadata          |   ❌   |    ✅    | The MPL master metadata account initialized via CPI          |
| xNFT                     |   ❌   |    ✅    | The `Xnft` program account being initialized and populated   |
| Payer                    |   ✅   |    ✅    | The wallet paying for the initialization rent fees           |
| Publisher                |   ✅   |    ❌    | The account who is the original publisher and creator        |
| System Program           |   ❌   |    ❌    | ---                                                          |
| Token Program            |   ❌   |    ❌    | ---                                                          |
| Associated Token Program |   ❌   |    ❌    | ---                                                          |
| Token Metadata Program   |   ❌   |    ❌    | ---                                                          |
| Rent Sysvar              |   ❌   |    ❌    | ---                                                          |

## Arguments

| Name   | Type     | Description                            |
| :----- | :------- | :------------------------------------- |
| Name   | `String` | The name of the newly initialized xNFT |
| Params | `struct` | Schema defined below                   |

### Parameters Struct

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/state/parameters.rs)

```rust
#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreatorsParam {
    pub address: Pubkey,
    pub share: u8,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreateXnftParams {
    pub creators: Vec<CreatorsParam>,
    pub curator: Option<Pubkey>,
    pub install_authority: Option<Pubkey>,
    pub install_price: u64,
    pub install_vault: Pubkey,
    pub kind: Kind,
    pub seller_fee_basis_points: u16,
    pub supply: Option<u64>,
    pub symbol: String,
    pub tag: Tag,
    pub uri: String,
}
```
