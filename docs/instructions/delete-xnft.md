# Delete an xNFT

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/delete_xnft.rs)

This allows the authority to delete the xNFT program account and burn the underlying NFT as well if the xNFT is `Kind::App`.

## Additional Constraints

- xNFT is meets one of the following criteria:
  - is of `Kind::Collectible`
  - has `0` total installs and `0` number of ratings
- The underlying MPL metadata account is mutable
- The update authority is the current holder of the master token

## Accounts

| Name            | Signer | Writable | Description                                                                |
| :-------------- | :----: | :------: | :------------------------------------------------------------------------- |
| xNFT            |   ❌   |    ✅    | The `Xnft` program account being closed                                    |
| Master Metadata |   ❌   |    ✅    | The MPL master metadata account that is being validated                    |
| Master Token    |   ❌   |    ✅    | The master token account of the xNFT to be validated and optionally closed |
| Master Mint     |   ❌   |    ✅    | The master token mint of the underlying SPL token                          |
| Receiver        |   ❌   |    ✅    | The recipient of the rent from the closed program accounts                 |
| Authority       |   ✅   |    ❌    | The update authority and holder of the xNFT being closed                   |
| Token Program   |   ❌   |    ❌    | ---                                                                        |

## Arguments

!> None
