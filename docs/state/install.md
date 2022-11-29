# Install

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/state/install.rs)

**Total Size**: `176` (with reserved space)

| Name            | Type      | Offset | Size | Description                                                                                                          |
| :-------------- | :-------- | :----- | :--- | :------------------------------------------------------------------------------------------------------------------- |
| Authority       | `Pubkey`  | 8      | 32   | The owning account of the installation                                                                               |
| xNFT            | `Pubkey`  | 40     | 32   | The xNFT that is installed                                                                                           |
| Master Metadata | `Pubkey`  | 72     | 32   | The [MPL master metadata](https://docs.metaplex.com/programs/token-metadata/accounts#metadata) of the installed xNFT |
| Edition         | `u64`     | 104    | 8    | The globally sequential number of the install                                                                        |
| _Reserved_      | `[u8;64]` | 112    | 64   | Reserved byte space for additive changes                                                                             |
