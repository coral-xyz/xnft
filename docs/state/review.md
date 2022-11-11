# Review

| Name   | Type     | Offset | Size         | Description                                               |
| :----- | :------- | :----- | :----------- | :-------------------------------------------------------- |
| Author | `Pubkey` | 8      | 32           | The account that created the review                       |
| xNFT   | `Pubkey` | 40     | 32           | The xNFT that is associated with the review               |
| Rating | `u8`     | 72     | 1            | The numerical `1-5` rating for the review                 |
| URI    | `String` | 73     | (4 + length) | The URI of the off-chain JSON blob containing the comment |
