# Transfer xNFT Ownership

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/transfer.rs)

Transfers the xNFT master token between authorities. The instruction manages the thawing and refreezing of the source and destination token accounts respectively in order to maintain the frozen state of the master token.

The current authority that is signing for the instruction will pay for the initialization of the recipient's new associated token account, but will be a net `0 SOL` transaction (minus the transaction processing fee) since their own associated token account will be closed at the end of the instruction.

## Accounts

| Name                 | Signer | Writable | Description                                                                                      |
| :------------------- | :----: | :------: | :----------------------------------------------------------------------------------------------- |
| xNFT                 |   ❌   |    ❌    | The `Xnft` program account of the master token being transferred (must be `Kind::App`)           |
| Source               |   ❌   |    ✅    | The associated token account that currently holds the xNFT master token                          |
| Destination          |   ❌   |    ✅    | The associated token account that the master token should be transferred into                    |
| Master Mint          |   ❌   |    ❌    | The master mint of the xNFT token account                                                        |
| Recipient            |   ❌   |    ❌    | The account that is the authority of the destination associated token account                    |
| Authority            |   ✅   |    ✅    | The authority and current holder of the xNFT master token in the source associated token account |
| System Program       |   ❌   |    ❌    | ---                                                                                              |
| Token Program        |   ❌   |    ❌    | ---                                                                                              |
| Assoc. Token Program |   ❌   |    ❌    | ---                                                                                              |
| Rent                 |   ❌   |    ❌    | ---                                                                                              |

## Arguments

!> None
