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
- The master edition will be created with a `0` max supply to disable NFT printing post-initialization
- Once the master edition is created via CPI, mint and metadata authorities will be transferred as defined by the MPL protocol

## Accounts

| Name                     | Signer | Writable | Description                                                  |
| :----------------------- | :----: | :------: | :----------------------------------------------------------- |
| Master Mint              |   ❌   |    ✅    | The master mint for the xNFT token to be initialized         |
| Master Token             |   ❌   |    ✅    | The master token account for the xNFT mint to be initialized |
| Master Metadata          |   ❌   |    ✅    | The MPL master metadata account initialized via CPI          |
| Master Edition           |   ❌   |    ✅    | The xNFT master edition initialized via CPI                  |
| xNFT                     |   ❌   |    ✅    | The `Xnft` program account being initialized and populated   |
| Payer                    |   ✅   |    ✅    | The wallet paying for the initialization rent fees           |
| Publisher                |   ✅   |    ❌    | The account who is the original publisher and creator        |
| System Program           |   ❌   |    ❌    | ---                                                          |
| Token Program            |   ❌   |    ❌    | ---                                                          |
| Associated Token Program |   ❌   |    ❌    | ---                                                          |
| Token Metadata Program   |   ❌   |    ❌    | ---                                                          |
| Rent Sysvar              |   ❌   |    ❌    | ---                                                          |

## Arguments

| Name    | Type             | Description                                     |
| :------ | :--------------- | :---------------------------------------------- |
| Name    | `String`         | The name of the newly initialized xNFT          |
| Curator | `Option<Pubkey>` | The optional public key of the assigned curator |
| Params  | `struct`         | Schema defined below                            |

### Parameters Struct

```rust
pub struct CreatorsParam {
    address: Pubkey,
    share: u8,
}

pub struct CreateXnftParams {
    collection: Option<Pubkey>,
    creators: Vec<CreatorsParam>,
    install_authority: Option<Pubkey>,
    install_price: u64,
    install_vault: Pubkey,
    kind: Kind,
    l1: L1,
    seller_fee_basis_points: u16,
    supply: Option<u64>,
    symbol: String,
    tag: Tag,
    uri: String,
}
```
