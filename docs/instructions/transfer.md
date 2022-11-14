# Transfer xNFT Ownership

TODO:

## Accounts

| Name                 | Signer | Writable | Description                                                                                      |
| :------------------- | :----: | :------: | :----------------------------------------------------------------------------------------------- |
| xNFT                 |   ❌   |    ❌    | The `Xnft` program account of the master token being transferred                                 |
| Master Mint          |   ❌   |    ❌    | The master mint of the xNFT token account                                                        |
| Source               |   ❌   |    ✅    | The associated token account that currently holds the xNFT master token                          |
| Destination          |   ❌   |    ✅    | The associated token account that the master token should be transferred into                    |
| Recipient            |   ❌   |    ❌    | The account that is the authority of the destination associated token account                    |
| Authority            |   ✅   |    ✅    | The authority and current holder of the xNFT master token in the source associated token account |
| System Program       |   ❌   |    ❌    | ---                                                                                              |
| Token Program        |   ❌   |    ❌    | ---                                                                                              |
| Assoc. Token Program |   ❌   |    ❌    | ---                                                                                              |
| Rent                 |   ❌   |    ❌    | ---                                                                                              |

## Arguments

!> None
