# Update an xNFT

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/update_xnft.rs)

TODO:

## Accounts

| Name                   | Signer | Writable | Description                                                                                                                 |
| :--------------------- | :----: | :------: | :-------------------------------------------------------------------------------------------------------------------------- |
| xNFT                   |   ❌   |    ✅    | The `Xnft` program account being updated                                                                                    |
| Master Token           |   ❌   |    ❌    | The master token account of the xNFT to verify ownership                                                                    |
| Master Metadata        |   ❌   |    ✅    | The MPL master metadata account of the xNFT master mint                                                                     |
| Update Authority       |   ❌   |    ❌    | The account that acts as the xNFT's update gatekeeping authority - either the owner or the curator if assigned and verified |
| xNFT Authority         |   ✅   |    ❌    | The owner of the xNFT and it's master token                                                                                 |
| Token Metadata Program |   ❌   |    ❌    | ---                                                                                                                         |

## Arguments

| Name    | Type     | Description          |
| :------ | :------- | :------------------- |
| Updates | `struct` | Schema defined below |

### Updates Struct

```rust
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateParams {
    install_authority: Option<Pubkey>,
    install_price: u64,
    install_vault: Pubkey,
    supply: Option<u64>,
    tag: Tag,
    uri: Option<String>,
}
```
