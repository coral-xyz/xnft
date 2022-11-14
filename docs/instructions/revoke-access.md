# Revoke Access to Private xNFT

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/revoke_access.rs)

TODO:

## Accounts

| Name      | Signer | Writable | Description                                                                          |
| :-------- | :----: | :------: | :----------------------------------------------------------------------------------- |
| xNFT      |   ❌   |    ❌    | The `Xnft` program account that the target wallet is losing access to                |
| Wallet    |   ❌   |    ❌    | The account that is losing access                                                    |
| Access    |   ❌   |    ✅    | The `Access` program account delegated to the wallet that is being closed            |
| Authority |   ✅   |    ✅    | The install authority of the `Xnft` program account and receiver of the closure rent |

## Arguments

!> None
