# Donating to xNFT Creators

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/donate.rs)

This instruction allows users to make a donation to the creators of an xNFT and enforces the donation share based on each creator's share value in the Metaplex metadata account.

## Additional Constraints

- The `Kind` variant of the xNFT must be `App`
- The master metadata account provided to the instruction is the same as the one in the xNFT account data

## Accounts

| Name            | Signer | Writable | Description                                                               |
| :-------------- | :----: | :------: | :------------------------------------------------------------------------ |
| xNFT            |   ❌   |    ❌    | The `Xnft` program account that is being donated to (must be `Kind::App`) |
| Master Metadata |   ❌   |    ❌    | The MPL metadata program account that is associated with the xNFT         |
| Donator         |   ✅   |    ✅    | The signer that is donating funds to the xNFT creators                    |
| System Program  |   ❌   |    ❌    | ---                                                                       |

### Remaining Accounts

!> The addresses of all creators listed on the Metaplex metadata account should be provided _in order_ as `writable` so that they can be used in CPI calls.

## Arguments

| Name   | Type  | Description                                                             |
| :----- | :---- | :---------------------------------------------------------------------- |
| Amount | `u64` | The amount of lamports that the donator is sending to the xNFT creators |
