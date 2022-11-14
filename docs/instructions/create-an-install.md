# Create an Install

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/create_install.rs)

Allows a wallet or delegated authority to create an on-chain installation of an xNFT for themselves or another wallet within the bounds of the access controls in place.

## Accounts

| Name           | Signer | Writable | Description                                                                                                                 |
| :------------- | :----: | :------: | :-------------------------------------------------------------------------------------------------------------------------- |
| xNFT           |   ❌    |    ✅     | The `Xnft` that is being installed by the authority                                                                         |
| Install Vault  |   ❌    |    ✅     | The account that receives potential installation payments from the payer                                                    |
| Install        |   ❌    |    ✅     | The `Install` program account being initialized                                                                             |
| Authority      |   ✅    |    ✅     | The wallet created the installation for themselves or for a delegate - pays for `Install` initialization and potential fees |
| Target         |   ✅    |    ❌     | The wallet receiving the installation of the xNFT                                                                           |
| System Program |   ❌    |    ❌     | ---                                                                                                                         |

## Arguments

!> None
