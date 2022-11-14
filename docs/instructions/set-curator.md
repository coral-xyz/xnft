# Set a Curator for an xNFT

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/set_curator.rs)

TODO:

## Accounts

| Name         | Signer | Writable | Description                                                                  |
| :----------- | :----: | :------: | :--------------------------------------------------------------------------- |
| xNFT         |   ❌   |    ✅    | The `Xnft` program account being assigned the curator                        |
| Master Token |   ❌   |    ❌    | The master token account for the xNFT to verify ownership with the authority |
| Curator      |   ❌   |    ❌    | The account that will act as the curating authority                          |
| Authority    |   ✅   |    ❌    | The owner of the xNFT's master token account                                 |

## Arguments

!> None
