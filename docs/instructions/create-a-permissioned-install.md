# Create a Permissioned Install

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/create_permissioned_install.rs)

Similar to [Create an Install](#create-an-install) but is meant for the installation of a "private" xNFT given that the signer has been granted access by the xNFT's install authority.

## Accounts

| Name           | Signer | Writable | Description                                                              |
| :------------- | :----: | :------: | :----------------------------------------------------------------------- |
| xNFT           |   ❌    |    ✅     | The `Xnft` being installed by the authority                              |
| Install Vault  |   ❌    |    ✅     | The account that receives potential installation payments from the payer |
| Install        |   ❌    |    ✅     | The `Install` program account being initialized                          |
| Access         |   ❌    |    ❌     | The `Access` program account allocated to the signing authority          |
| Authority      |   ✅    |    ✅     | The wallet creating and receiving the installation                       |
| System Program |   ❌    |    ❌     | ---                                                                      |

## Arguments

!> None
