# Create an xNFT

TODO:

## Accounts

| Name                     | Signer | Writable | Description                                                  |
| :----------------------- | :----: | :------: | :----------------------------------------------------------- |
| Master Mint              |   ❌    |    ✅     | The master mint for the xNFT token to be initialized         |
| Master Token             |   ❌    |    ✅     | The master token account for the xNFT mint to be initialized |
| Master Metadata          |   ❌    |    ✅     | The MPL master metadata account initialized via CPI          |
| Master Edition           |   ❌    |    ✅     | The xNFT master edition initialized via CPI                  |
| xNFT                     |   ❌    |    ✅     | The `Xnft` program account being initialized and populated   |
| Payer                    |   ✅    |    ✅     | The wallet paying for the initialization rent fees           |
| Publisher                |   ✅    |    ❌     | The account who is the original publisher and creator        |
| System Program           |   ❌    |    ❌     | ---                                                          |
| Token Program            |   ❌    |    ❌     | ---                                                          |
| Associated Token Program |   ❌    |    ❌     | ---                                                          |
| Token Metadata Program   |   ❌    |    ❌     | ---                                                          |
| Rent Sysvar              |   ❌    |    ❌     | ---                                                          |

## Arguments

| Name    | Type             | Description                                     |
| :------ | :--------------- | :---------------------------------------------- |
| Name    | `String`         | The name of the newly initialized xNFT          |
| Curator | `Option<Pubkey>` | The optional public key of the assigned curator |
| Params  | `struct`         | Schema defined below                            |

### Parameters Struct

```rust
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
