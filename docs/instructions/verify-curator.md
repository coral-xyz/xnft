## Verify the Curator of an xNFT

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/verify_curator.rs)

Invoked by a curator account in order to verified their assignment to an xNFT.

This process is initiated by the authority of the xNFT through the [`set_curator`](/instructions/set-curator.md) instruction to set the _unverified_ curator public key in the xNFT program account data.

!> The association with a curator on an xNFT should only be respected if the `verified` subfield of the `CuratorStatus` xNFT account field is `true` and has protocol-enforced implications on xNFT updates as defined in the the [Update an xNFT](/instructions/update-an-xnft.md) section.

## Additional Constraints

- The signing authority matches the public key of the curator being verified on the xNFT

### Accounts

| Name    | Signer | Writable | Description                                                        |
| :------ | :----: | :------: | :----------------------------------------------------------------- |
| xNFT    |   ❌   |    ✅    | The `Xnft` program account whose curator is being verified         |
| Curator |   ✅   |    ❌    | The account that is assigned as the unverified curator on the xNFT |

### Arguments

!> None
