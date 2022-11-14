# Create a Review

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/create_review.rs)

TODO:

## Accounts

| Name           | Signer | Writable | Description                                                                       |
| :------------- | :----: | :------: | :-------------------------------------------------------------------------------- |
| Install        |   ❌    |    ❌     | The `Install` program account owned by the authority for proof of ownership       |
| Master Token   |   ❌    |    ❌     | The master token account of the xNFT to ensure owners are not reviewing their own |
| xNFT           |   ❌    |    ✅     | The `Xnft` program account being reviewed                                         |
| Review         |   ❌    |    ✅     | The `Review` program account being initialized                                    |
| Author         |   ✅    |    ✅     | The author of the `Review` account and paying of the rent fees                    |
| System Program |   ❌    |    ❌     | ---                                                                               |

## Arguments

| Name   | Type     | Description                                              |
| :----- | :------- | :------------------------------------------------------- |
| URI    | `String` | The URI of the off-chain JSON blob with the comment data |
| Rating | `u8`     | The 1-5 numerical rating of the xNFT for the review      |
