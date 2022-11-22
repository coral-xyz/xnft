# Create an Associated xNFT

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/create_associated_xnft.rs)

Unlike the standard [`create_xnft`](/instructions/create-an-xnft.md) instruction, this allows a user to create an xNFT that is soul-bound to an existing digital collectible (an NFT that is either an individual item or the collection entity itself).

## Additional Constraints

- Master metadata must be mutable
- The publishing account is the update authority of the master metadata
- The publishing account is the owner of the master token

## Accounts

| Name            | Signer | Writable | Description                                                             |
| :-------------- | :----: | :------: | :---------------------------------------------------------------------- |
| Master Mint     |   ❌   |    ❌    | The master mint for the targeted digital collectible                    |
| Master Token    |   ❌   |    ❌    | The master token account for the digital collectible's mint             |
| Master Metadata |   ❌   |    ❌    | The MPL master metadata account for the targeted digital collectible    |
| xNFT            |   ❌   |    ✅    | The xNFT program account being initialized for the collectible          |
| Payer           |   ✅   |    ✅    | The account paying for the rent exemption of the initialized account(s) |
| Publisher       |   ✅   |    ❌    | The account that is signing for the creation of the new xNFT            |
| System Program  |   ❌   |    ❌    | ---                                                                     |

## Arguments

| Name   | Type     | Description                                                                  |
| :----- | :------- | :--------------------------------------------------------------------------- |
| Kind   | `Kind`   | The variant of the `Kind` enum that describes the digital collectible target |
| Params | `struct` | Schema defined in the [auxiliary state section](/state/auxiliary.md)         |
