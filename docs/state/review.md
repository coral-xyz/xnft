# Review

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/state/review.rs)

| Name       | Type      | Offset | Size         | Description                                               |
| :--------- | :-------- | :----- | :----------- | :-------------------------------------------------------- |
| Author     | `Pubkey`  | 8      | 32           | The account that created the review                       |
| xNFT       | `Pubkey`  | 40     | 32           | The xNFT that is associated with the review               |
| Rating     | `u8`      | 72     | 1            | The numerical `1-5` rating for the review                 |
| URI        | `String`  | 73     | (4 + length) | The URI of the off-chain JSON blob containing the comment |
| _Reserved_ | `[u8;32]` | XXX    | 32           | Reserved byte space for additive changes                  |
