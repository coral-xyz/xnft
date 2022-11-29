# Access

[Source Code](https://github.com/coral-xyz/xnft/blob/master/programs/xnft/src/state/access.rs)

**Total Size**: `105` (with reserved space)

| Name       | Type      | Offset | Size | Description                                   |
| :--------- | :-------- | :----- | :--- | :-------------------------------------------- |
| Wallet     | `Pubkey`  | 8      | 32   | The wallet that is granted access             |
| xNFT       | `Pubkey`  | 40     | 32   | The xNFT that the wallet is granted access to |
| Bump       | `u8`      | 72     | 1    | The nonce of the program account PDA          |
| _Reserved_ | `[u8;32]` | 73     | 32   | Reserved byte space for additive changes      |
