# Delete an Install

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/instructions/delete_install.rs)

TODO:

## Accounts

| Name      | Signer | Writable | Description                                                            |
| :-------- | :----: | :------: | :--------------------------------------------------------------------- |
| Install   |   ❌    |    ✅     | The `Install` program account being closed                             |
| Receiver  |   ❌    |    ✅     | The wallet receiving the rent returned for closing the program account |
| Authority |   ✅    |    ❌     | The owner of the `Install` account being deleted                       |

## Arguments

!> None
