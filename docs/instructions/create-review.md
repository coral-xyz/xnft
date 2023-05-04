# Create a Review

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/create_review.rs)

This allows user's who have an active installation of an xNFT to leave a review (containing an optional comment and 0-5 rating).

The master token is provided in order to prevent the owner of the xNFT from leaving their own review.

Currently, if you want a comment associated with the `Review`, the comment should be processed and uploaded to a storage backend out-of-band of the instruction processing and then provide a deterministic URI to the comment data/JSON blob as an instruction parameter to be added to the account data of the `Review` program account.

(This comment handling is subject to change in the near future)

## Additional Constraints

- xNFT is of `Kind::App`
- The provided `Install` account is owned by the author (signer)
- The author does not own the xNFT/master token account being reviewed

## Accounts

| Name           | Signer | Writable | Description                                                                       |
| :------------- | :----: | :------: | :-------------------------------------------------------------------------------- |
| Install        |   ❌   |    ❌    | The `Install` program account owned by the authority for proof of ownership       |
| Master Token   |   ❌   |    ❌    | The master token account of the xNFT to ensure owners are not reviewing their own |
| xNFT           |   ❌   |    ✅    | The `Xnft` program account being reviewed                                         |
| Review         |   ❌   |    ✅    | The `Review` program account being initialized                                    |
| Author         |   ✅   |    ✅    | The author of the `Review` account and paying of the rent fees                    |
| System Program |   ❌   |    ❌    | ---                                                                               |

## Arguments

| Name   | Type     | Description                                              |
| :----- | :------- | :------------------------------------------------------- |
| URI    | `String` | The URI of the off-chain JSON blob with the comment data |
| Rating | `u8`     | The 1-5 numerical rating of the xNFT for the review      |
