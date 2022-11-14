# Events

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/events.rs)

## `AccessGranted`

| Field    |   Type   | Description                                                     |
| :------- | :------: | :-------------------------------------------------------------- |
| `wallet` | `Pubkey` | The public key of the account that was given access             |
| `xnft`   | `Pubkey` | The public key of the xNFT that the account was given access to |

## `InstallationCreated`

| Field       |   Type   | Description                                           |
| :---------- | :------: | :---------------------------------------------------- |
| `installer` | `Pubkey` | The public key of the account that installed the xNFT |
| `xnft`      | `Pubkey` | The public key of the xNFT that was installed         |

## `ReviewCreated`

| Field    |   Type   | Description                                           |
| :------- | :------: | :---------------------------------------------------- |
| `author` | `Pubkey` | The public key of the account that created the review |
| `rating` |   `u8`   | A 0-5 numerical rating associated with the review     |
| `xnft`   | `Pubkey` | The public key of the xNFT that was reviewed          |

## `XnftUpdated`

| Field  |   Type   | Description                                             |
| :----- | :------: | :------------------------------------------------------ |
| `xnft` | `Pubkey` | The public key of the xNFT that the account was updated |
