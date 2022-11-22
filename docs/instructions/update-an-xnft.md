# Update an xNFT

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/update_xnft.rs)

Allows the authority of an xNFT to update certain values on the xNFT program account and the master metadata account as defined by the [`UpdateParams` argument structure below](#updates-struct).

!> If the xNFT has a verified curator associated with it, the instruction requires a signature from the curator account in order to be accepted.

## Additional Constraints

- The master metadata account is mutable
- If the xNFT has a verified curator associated with it, the signing authority must be the curator
- New supply values must be additive, or not exceed the current number of installations if updating from infinite to finite

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

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/state/parameters.rs)

```rust
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateParams {
    pub install_authority: Option<Pubkey>,
    pub install_price: u64,
    pub install_vault: Pubkey,
    pub supply: Option<u64>,
    pub tag: Tag,
    pub uri: Option<String>,
}
```
