# Set a Curator for an xNFT

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/set_curator.rs)

Assigns an unverified curator public key to the xNFT.

This value should not be respected until the corresponding curator have used [`verify_curator`](/instructions/verify-curator.md) to set the `verified` subfield of the [`CuratorStatus`](/state/auxiliary.md) structure to `true` on the xNFT program account.

!> Once assigned and verified, further updates to the xNFT or its metadata via [`update_xnft`](/instructions/update-an-xnft.md) will be gated by requiring a signature from the curator account.

## Additional Constraints

- There is not already a verified curator assigned to the xNFT

## Accounts

| Name         | Signer | Writable | Description                                                                  |
| :----------- | :----: | :------: | :--------------------------------------------------------------------------- |
| xNFT         |   ❌   |    ✅    | The `Xnft` program account being assigned the curator                        |
| Master Token |   ❌   |    ❌    | The master token account for the xNFT to verify ownership with the authority |
| Curator      |   ❌   |    ❌    | The account that will act as the curating authority                          |
| Authority    |   ✅   |    ❌    | The owner of the xNFT's master token account                                 |

## Arguments

!> None
