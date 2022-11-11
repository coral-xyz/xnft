# xNFT

| Name              | Type                    | Offset | Size     | Description                                                                                                 |
| :---------------- | :---------------------- | :----- | :------- | :---------------------------------------------------------------------------------------------------------- |
| Publisher         | `Pubkey`                | 8      | 32       | The account that originally published the xNFT                                                              |
| Install Vault     | `Pubkey`                | 40     | 32       | The account that receives any potential installation payments                                               |
| Master Edition    | `Pubkey`                | 72     | 32       | The [MPL master edition](https://docs.metaplex.com/programs/token-metadata/accounts#master-edition) account |
| Master Metadata   | `Pubkey`                | 104    | 32       | The [MPL master metadata](https://docs.metaplex.com/programs/token-metadata/accounts#metadata) account      |
| Master Mint       | `Pubkey`                | 136    | 32       | The mint of the xNFT master token                                                                           |
| Install Authority | `Option<Pubkey>`        | 168    | 33       | The optional install authority account for installation gatekeeping                                         |
| Bump              | `u8`                    | 201    | 1        | The nonce of the program account PDA                                                                        |
| Kind              | `Kind`                  | 202    | 1        | The enum variant representing the type of xNFt                                                              |
| Tag               | `Tag`                   | 203    | 1        | The enum variant categorizing the xNFT                                                                      |
| Name              | `String`                | 204    | (4 + 30) | The name of the xNFT                                                                                        |
| Total Installs    | `u64`                   | 238    | 8        | The amount of installs of the xNFT that have been created                                                   |
| Install Price     | `u64`                   | 246    | 8        | The price to install the xNFT                                                                               |
| Created Timestamp | `i64`                   | 254    | 8        | The unix timestamp of when the xNFT was created                                                             |
| Updated Timestamp | `i64`                   | 262    | 8        | The unix timestamp of when the xNFT was last updated                                                        |
| Suspended         | `bool`                  | 270    | 1        | Flag for whether new installations of the xNFT are suspended                                                |
| Total Rating      | `u64`                   | 271    | 8        | The total cumulative rating of the xNFT across all reviews                                                  |
| Number of Ratings | `u32`                   | 279    | 4        | The total number of ratings that exist on-chain for the xNFT                                                |
| L1                | `L1`                    | 283    | 1        | The enum variant to describe the associated L1 client                                                       |
| Supply            | `Option<u64>`           | 284    | 9        | The optional fixed supply/installation amount                                                               |
| Curator           | `Option<CuratorStatus>` | 293    | 34       | The optional curator entity status                                                                          |
