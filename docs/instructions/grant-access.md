# Grant Access to Private xNFT

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/grant_access.rs)

This instruction allows an install authority of a "private" xNFT to delegate asychronous access to specific wallets to create installations on their own, similar to creating OAuth keys for an entity to act within a permissioned system. Once created, that wallet cause use their `Access` program account with [`create_permissioned_install`](/instructions/create-permissioned-install.md) to install the "private" xNFT themselves.

## Additional Constraints

- The signing authority is the install authority of the xNFT

## Accounts

| Name           | Signer | Writable | Description                                                                                        |
| :------------- | :----: | :------: | :------------------------------------------------------------------------------------------------- |
| xNFT           |   ❌   |    ❌    | The `Xnft` program account that the target wallet is being granted access to (must be `Kind::App`) |
| Wallet         |   ❌   |    ❌    | The account that is being granted access                                                           |
| Access         |   ❌   |    ✅    | The `Access` program account that is being initialized                                             |
| Authority      |   ✅   |    ✅    | The install authority of the `Xnft` program account and payer of the rent fees                     |
| System Program |   ❌   |    ❌    | ---                                                                                                |

## Arguments

!> None
