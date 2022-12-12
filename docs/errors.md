# Program Errors

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/lib.rs)

| Name                          |   Hex    |  Code  | Message                                                                            |
| :---------------------------- | :------: | :----: | :--------------------------------------------------------------------------------- |
| CannotReviewOwned             | `0x1770` | `6000` | You cannot create a review for an xNFT that you currently own or published         |
| CuratorAlreadySet             | `0x1771` | `6001` | There is already a verified curator assigned                                       |
| CuratorAuthorityMismatch      | `0x1772` | `6002` | The expected curator authority did not match expected                              |
| CuratorMismatch               | `0x1773` | `6003` | The provided curator account did not match the one assigned                        |
| InstallAuthorityMismatch      | `0x1774` | `6004` | The provided xNFT install authority did not match                                  |
| InstallExceedsSupply          | `0x1775` | `6005` | The max supply has been reached for the xNFT                                       |
| InstallOwnerMismatch          | `0x1776` | `6006` | The asserted authority/owner did not match that of the Install account             |
| MetadataIsImmutable           | `0x1777` | `6007` | The metadata of the xNFT is marked as immutable                                    |
| MustBeApp                     | `0x1778` | `6008` | The xNFT must be of `Kind::App` for this operation                                 |
| RatingOutOfBounds             | `0x1779` | `6009` | The rating for a review must be between 0 and 5                                    |
| ReviewInstallMismatch         | `0x177a` | `6010` | The installation provided for the review does not match the xNFT                   |
| SupplyReduction               | `0x177b` | `6011` | Updated supply is less than the original supply set on creation                    |
| SuspendedInstallation         | `0x177c` | `6012` | Attempting to install a currently suspended xNFT                                   |
| UnauthorizedInstall           | `0x177d` | `6013` | The access account provided is not associated with the wallet                      |
| UpdateAuthorityMismatch       | `0x177e` | `6014` | The signer did not match the update authority of the metadata account or the owner |
| UpdateReviewAuthorityMismatch | `0x177f` | `6015` | The signing authority for the xNFT update did not match the review authority       |
| UriExceedsMaxLength           | `0x1780` | `6016` | The metadata URI provided exceeds the maximum length                               |
