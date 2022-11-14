# Grant Access to Private xNFT

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/grant_access.rs)

TODO:

## Accounts

| Name           | Signer | Writable | Description                                                                    |
| :------------- | :----: | :------: | :----------------------------------------------------------------------------- |
| xNFT           |   ❌    |    ❌     | The `Xnft` program account that the target wallet is being granted access to   |
| Wallet         |   ❌    |    ❌     | The account that is being granted access                                       |
| Access         |   ❌    |    ✅     | The `Access` program account that is being initialized                         |
| Authority      |   ✅    |    ✅     | The install authority of the `Xnft` program account and payer of the rent fees |
| System Program |   ❌    |    ❌     | ---                                                                            |

## Arguments

!> None
