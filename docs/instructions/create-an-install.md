# Create an Install

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/create_install.rs)

Allows a wallet or delegated authority to create an on-chain installation of an xNFT for themselves or another wallet within the bounds of the access controls in place.

If the xNFT is "private" (meaning there is an assigned install authority on the account), a wallet should either create their own installation (once given an `Access` program account from the authority via [`grant_access`](/instructions/grant_access.md)) using the [`create_permissioned_install`](/instructions/create-a-permissioned-install.md) or have the install authority themselves use this instruction to create a delegated installation on behalf of the desiring wallet.

## Accounts

| Name           | Signer | Writable | Description                                                                                                                 |
| :------------- | :----: | :------: | :-------------------------------------------------------------------------------------------------------------------------- |
| xNFT           |   ❌   |    ✅    | The `Xnft` that is being installed by the authority                                                                         |
| Install Vault  |   ❌   |    ✅    | The account that receives potential installation payments from the payer                                                    |
| Install        |   ❌   |    ✅    | The `Install` program account being initialized                                                                             |
| Authority      |   ✅   |    ✅    | The wallet created the installation for themselves or for a delegate - pays for `Install` initialization and potential fees |
| Target         |   ✅   |    ❌    | The wallet receiving the installation of the xNFT                                                                           |
| System Program |   ❌   |    ❌    | ---                                                                                                                         |

## Arguments

!> None
