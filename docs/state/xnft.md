# xNFT

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/state/xnft.rs)

| Name              | Type                    | Size     | Description                                                                                            |
| :---------------- | :---------------------- | :------- | :----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Publisher         | `Pubkey`                | 32       | The account that originally published the xNFT                                                         |
| Install Vault     | `Pubkey`                | 32       | The account that receives any potential installation payments                                          |
| Master Metadata   | `Pubkey`                | 32       | The [MPL master metadata](https://docs.metaplex.com/programs/token-metadata/accounts#metadata) account |
| Master Mint       | `Pubkey`                | 32       | The mint of the xNFT master token                                                                      |
| Install Authority | `Option<Pubkey>`        | 33       | The optional install authority account for installation gatekeeping                                    |
| Curator           | `Option<CuratorStatus>` | 34       | The optional curator entity status                                                                     |
| Bump              | `u8`                    | 1        | The nonce of the program account PDA                                                                   |
| Kind              | `Kind`                  | 1        | The enum variant representing the type of xNFt                                                         |
| Tag               | `Tag`                   | 1        | The enum variant categorizing the xNFT                                                                 |
| Name              | `String`                | (4 + 32) | The name of the xNFT                                                                                   |
| Total Installs    | `u64`                   | 8        | The amount of installs of the xNFT that have been created                                              |
| Install Price     | `u64`                   | 246      | 8                                                                                                      | The price to install the xNFT                                |
| Created Timestamp | `i64`                   | 254      | 8                                                                                                      | The unix timestamp of when the xNFT was created              |
| Updated Timestamp | `i64`                   | 262      | 8                                                                                                      | The unix timestamp of when the xNFT was last updated         |
| Suspended         | `bool`                  | 270      | 1                                                                                                      | Flag for whether new installations of the xNFT are suspended |
| Total Rating      | `u64`                   | 271      | 8                                                                                                      | The total cumulative rating of the xNFT across all reviews   |
| Number of Ratings | `u32`                   | 279      | 4                                                                                                      | The total number of ratings that exist on-chain for the xNFT |
| L1                | `L1`                    | 283      | 1                                                                                                      | The enum variant to describe the associated L1 client        |
| Supply            | `Option<u64>`           | 284      | 9                                                                                                      | The optional fixed supply/installation amount                |
