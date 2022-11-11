# Toggle Suspension of an xNFT

TODO:

## Accounts

| Name         | Signer | Writable | Description                                                                 |
| :----------- | :----: | :------: | :-------------------------------------------------------------------------- |
| xNFT         |   ❌    |    ✅     | The `Xnft` program account being suspended or unsuspended                   |
| Master Token |   ❌    |    ❌     | The master token account of the xNFT to verify ownership with the authority |
| Authority    |   ✅    |    ❌     | The owner of the xNFT and master token account                              |

## Arguments

| Name | Type   | Description                                                            |
| :--- | :----- | :--------------------------------------------------------------------- |
| Flag | `bool` | The boolean flag value for whether the xNFT should be suspended or not |
