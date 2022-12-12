# Create a Permissioned Install

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/create_permissioned_install.rs)

Similar to [Create an Install](#create-an-install) but is meant for the installation of a "private" xNFT given that the signer has been granted access by the xNFT's install authority.

The account receiving the installation should be the one signing for the transaction, and uses their associated `Access` program account as a permissioning gateway to initialize the `Install` (similar to the purpose of an authentication token or API key for HTTP requests). This requires the install authority of the xNFT to create an `Access` program account for the wallet prior to this instruction via the [`grant_access`](/instructions/grant-access.md) instruction.

!> This can only be successfully processed if the target xNFT is of `Kind::App`.

## Additional Constraints

- xNFT is of `Kind::App`
- xNFT is not suspended
- The `Access` account's associated wallet is the signing authority
- If the xNFT has a finite supply, the new installation does not exceed it

## Accounts

| Name           | Signer | Writable | Description                                                              |
| :------------- | :----: | :------: | :----------------------------------------------------------------------- |
| xNFT           |   ❌   |    ✅    | The `Xnft` being installed by the authority (must be `Kind::App`)        |
| Install Vault  |   ❌   |    ✅    | The account that receives potential installation payments from the payer |
| Install        |   ❌   |    ✅    | The `Install` program account being initialized                          |
| Access         |   ❌   |    ❌    | The `Access` program account allocated to the signing authority          |
| Authority      |   ✅   |    ✅    | The wallet creating and receiving the installation                       |
| System Program |   ❌   |    ❌    | ---                                                                      |

## Arguments

!> None
