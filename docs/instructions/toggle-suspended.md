# Toggle Suspension of an xNFT

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/set_suspended.rs)

Toggles the `suspended` field of the xNFT program account based on the provided flag argument value.

If set to `true`, no further installations of the xNFT can be created until it is set back to `false`.

## Accounts

| Name         | Signer | Writable | Description                                                                     |
| :----------- | :----: | :------: | :------------------------------------------------------------------------------ |
| xNFT         |   ❌   |    ✅    | The `Xnft` program account being suspended or unsuspended (must be `Kind::App`) |
| Master Token |   ❌   |    ❌    | The master token account of the xNFT to verify ownership with the authority     |
| Authority    |   ✅   |    ❌    | The owner of the xNFT and master token account                                  |

## Arguments

| Name | Type   | Description                                                            |
| :--- | :----- | :--------------------------------------------------------------------- |
| Flag | `bool` | The boolean flag value for whether the xNFT should be suspended or not |
