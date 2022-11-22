# Revoke Access to Private xNFT

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/revoke_access.rs)

Allows an install authority of a "private" xNFT to close the delegated `Access` program account of a wallet - effectively revoking their asynchronous installation permission/access to the xNFT.

## Additional Constraints

- The signing authority is the install authority of the xNFT

## Accounts

| Name      | Signer | Writable | Description                                                                          |
| :-------- | :----: | :------: | :----------------------------------------------------------------------------------- |
| xNFT      |   ❌   |    ❌    | The `Xnft` program account that the target wallet is losing access to                |
| Wallet    |   ❌   |    ❌    | The account that is losing access                                                    |
| Access    |   ❌   |    ✅    | The `Access` program account delegated to the wallet that is being closed            |
| Authority |   ✅   |    ✅    | The install authority of the `Xnft` program account and receiver of the closure rent |

## Arguments

!> None
