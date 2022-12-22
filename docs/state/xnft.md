# xNFT

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/state/xnft.rs)

**Total Size**: `598` (with reserved space)

| Name              | Type                    | Offset | Size         | Description                                                         |
| :---------------- | :---------------------- | :----- | :----------- | :------------------------------------------------------------------ |
| Publisher         | `Pubkey`                | 8      | 32           | The account that originally published the xNFT                      |
| Install Vault     | `Pubkey`                | 40     | 32           | The account that receives any potential installation payments       |
| Master Metadata   | `Pubkey`                | 72     | 32           | The MPL master metadata account                                     |
| Master Mint       | `Pubkey`                | 104    | 32           | The mint of the xNFT master token                                   |
| Install Authority | `Option<Pubkey>`        | 136    | 33           | The optional install authority account for installation gatekeeping |
| Curator           | `Option<CuratorStatus>` | 169    | 34           | The optional curator entity status                                  |
| URI               | `String`                | 203    | (4 + 200)    | The URI of the xNFT specific metadata                               |
| Mint Seed Name    | `Option<String>`        | 407    | (1 + 4 + 32) | If `Kind::App`, the original name used to seed the master mint      |
| Kind              | `Kind (Enum)`           | 444    | 1            | The enum variant representing the type of xNFT                      |
| Tag               | `Tag (Enum)`            | 445    | 1            | The enum variant categorizing the xNFT                              |
| Supply            | `Option<u64>`           | 446    | 9            | The optional fixed supply/installation amount                       |
| Total Installs    | `u64`                   | 455    | 8            | The amount of installs of the xNFT that have been created           |
| Install Price     | `u64`                   | 463    | 8            | The price to install the xNFT                                       |
| Created Timestamp | `i64`                   | 471    | 8            | The unix timestamp of when the xNFT was created                     |
| Updated Timestamp | `i64`                   | 479    | 8            | The unix timestamp of when the xNFT was last updated                |
| Total Rating      | `u64`                   | 487    | 8            | The total cumulative rating of the xNFT across all reviews          |
| Number of Ratings | `u32`                   | 495    | 4            | The total number of ratings that exist on-chain for the xNFT        |
| Suspended         | `bool`                  | 499    | 1            | Flag for whether new installations of the xNFT are suspended        |
| Bump              | `[u8]`                  | 500    | 1            | The nonce of the program account PDA                                |
| _Reserved_        | `[u8;97]`               | 501    | 97           | Reserved byte space for additive changes                            |
