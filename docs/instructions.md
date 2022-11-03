# Instructions

## Create an Install

Allows a wallet or delegated authority to create an on-chain installation of an xNFT for themselves or another wallet within the bounds of the access controls in place.

### Accounts

| Name           | Signer | Writable | Description                                                                                                                 |
| :------------- | :----: | :------: | :-------------------------------------------------------------------------------------------------------------------------- |
| xNFT           |   ❌   |    ✅    | The `Xnft` that is being installed by the authority                                                                         |
| Install Vault  |   ❌   |    ✅    | The account that receives potential installation payments from the payer                                                    |
| Install        |   ❌   |    ✅    | The `Install` program account being initialized                                                                             |
| Authority      |   ✅   |    ✅    | The wallet created the installation for themselves or for a delegate - pays for `Install` initialization and potential fees |
| Target         |   ✅   |    ❌    | The wallet receiving the installation of the xNFT                                                                           |
| System Program |   ❌   |    ❌    | ---                                                                                                                         |

### Arguments

!> None

---

## Create a Permissioned Install

Similar to [Create an Install](#create-an-install) but is meant for the installation of a "private" xNFT given that the signer has been granted access by the xNFT's install authority.

### Accounts

| Name           | Signer | Writable | Description                                                              |
| :------------- | :----: | :------: | :----------------------------------------------------------------------- |
| xNFT           |   ❌   |    ✅    | The `Xnft` being installed by the authority                              |
| Install Vault  |   ❌   |    ✅    | The account that receives potential installation payments from the payer |
| Install        |   ❌   |    ✅    | The `Install` program account being initialized                          |
| Access         |   ❌   |    ❌    | The `Access` program account allocated to the signing authority          |
| Authority      |   ✅   |    ✅    | The wallet creating and receiving the installation                       |
| System Program |   ❌   |    ❌    | ---                                                                      |

### Arguments

!> None

---

## Create a Review

TODO:

### Accounts

| Name           | Signer | Writable | Description                                                                       |
| :------------- | :----: | :------: | :-------------------------------------------------------------------------------- |
| Install        |   ❌   |    ❌    | The `Install` program account owned by the authority for proof of ownership       |
| Master Token   |   ❌   |    ❌    | The master token account of the xNFT to ensure owners are not reviewing their own |
| xNFT           |   ❌   |    ✅    | The `Xnft` program account being reviewed                                         |
| Review         |   ❌   |    ✅    | The `Review` program account being initialized                                    |
| Author         |   ✅   |    ✅    | The author of the `Review` account and paying of the rent fees                    |
| System Program |   ❌   |    ❌    | ---                                                                               |

### Arguments

| Name   | Type     | Description                                              |
| :----- | :------- | :------------------------------------------------------- |
| URI    | `String` | The URI of the off-chain JSON blob with the comment data |
| Rating | `u8`     | The 1-5 numerical rating of the xNFT for the review      |

---

## Create an xNFT

TODO:

### Accounts

| Name                     | Signer | Writable | Description                                                  |
| :----------------------- | :----: | :------: | :----------------------------------------------------------- |
| Master Mint              |   ❌   |    ✅    | The master mint for the xNFT token to be initialized         |
| Master Token             |   ❌   |    ✅    | The master token account for the xNFT mint to be initialized |
| Master Metadata          |   ❌   |    ✅    | The MPL master metadata account initialized via CPI          |
| Master Edition           |   ❌   |    ✅    | The xNFT master edition initialized via CPI                  |
| xNFT                     |   ❌   |    ✅    | The `Xnft` program account being initialized and populated   |
| Payer                    |   ✅   |    ✅    | The wallet paying for the initialization rent fees           |
| Publisher                |   ✅   |    ❌    | The account who is the original publisher and creator        |
| System Program           |   ❌   |    ❌    | ---                                                          |
| Token Program            |   ❌   |    ❌    | ---                                                          |
| Associated Token Program |   ❌   |    ❌    | ---                                                          |
| Token Metadata Program   |   ❌   |    ❌    | ---                                                          |
| Rent Sysvar              |   ❌   |    ❌    | ---                                                          |

### Arguments

| Name    | Type             | Description                                     |
| :------ | :--------------- | :---------------------------------------------- |
| Name    | `String`         | The name of the newly initialized xNFT          |
| Curator | `Option<Pubkey>` | The optional public key of the assigned curator |
| Params  | `struct`         | Schema defined below                            |

#### Parameters Struct

```rust
pub struct CreateXnftParams {
    collection: Option<Pubkey>,
    creators: Vec<CreatorsParam>,
    install_authority: Option<Pubkey>,
    install_price: u64,
    install_vault: Pubkey,
    kind: Kind,
    l1: L1,
    seller_fee_basis_points: u16,
    supply: Option<u64>,
    symbol: String,
    tag: Tag,
    uri: String,
}
```

---

## Delete an Install

TODO:

### Accounts

| Name      | Signer | Writable | Description                                                            |
| :-------- | :----: | :------: | :--------------------------------------------------------------------- |
| Install   |   ❌   |    ✅    | The `Install` program account being closed                             |
| Receiver  |   ❌   |    ✅    | The wallet receiving the rent returned for closing the program account |
| Authority |   ✅   |    ❌    | The owner of the `Install` account being deleted                       |

### Arguments

!> None

---

## Grant Access to Private xNFT

TODO:

### Accounts

| Name           | Signer | Writable | Description                                                                    |
| :------------- | :----: | :------: | :----------------------------------------------------------------------------- |
| xNFT           |   ❌   |    ❌    | The `Xnft` program account that the target wallet is being granted access to   |
| Wallet         |   ❌   |    ❌    | The account that is being granted access                                       |
| Access         |   ❌   |    ✅    | The `Access` program account that is being initialized                         |
| Authority      |   ✅   |    ✅    | The install authority of the `Xnft` program account and payer of the rent fees |
| System Program |   ❌   |    ❌    | ---                                                                            |

### Arguments

!> None

---

## Revoke Access to Private xNFT

TODO:

### Accounts

| Name      | Signer | Writable | Description                                                                          |
| :-------- | :----: | :------: | :----------------------------------------------------------------------------------- |
| xNFT      |   ❌   |    ❌    | The `Xnft` program account that the target wallet is losing access to                |
| Wallet    |   ❌   |    ❌    | The account that is losing access                                                    |
| Access    |   ❌   |    ✅    | The `Access` program account delegated to the wallet that is being closed            |
| Authority |   ✅   |    ✅    | The install authority of the `Xnft` program account and receiver of the closure rent |

### Arguments

!> None

---

## Set a Curator for an xNFT

TODO:

### Accounts

| Name         | Signer | Writable | Description                                                                  |
| :----------- | :----: | :------: | :--------------------------------------------------------------------------- |
| xNFT         |   ❌   |    ✅    | The `Xnft` program account being assigned the curator                        |
| Master Token |   ❌   |    ❌    | The master token account for the xNFT to verify ownership with the authority |
| Curator      |   ❌   |    ❌    | The account that will act as the curating authority                          |
| Authority    |   ✅   |    ❌    | The owner of the xNFT's master token account                                 |

### Arguments

!> None

---

## Toggle Suspension of an xNFT

TODO:

### Accounts

| Name         | Signer | Writable | Description                                                                 |
| :----------- | :----: | :------: | :-------------------------------------------------------------------------- |
| xNFT         |   ❌   |    ✅    | The `Xnft` program account being suspended or unsuspended                   |
| Master Token |   ❌   |    ❌    | The master token account of the xNFT to verify ownership with the authority |
| Authority    |   ✅   |    ❌    | The owner of the xNFT and master token account                              |

### Arguments

| Name | Type   | Description                                                            |
| :--- | :----- | :--------------------------------------------------------------------- |
| Flag | `bool` | The boolean flag value for whether the xNFT should be suspended or not |

---

## Transfer xNFT Ownership

TODO:

### Accounts

| Name          | Signer | Writable | Description                                                                                      |
| :------------ | :----: | :------: | :----------------------------------------------------------------------------------------------- |
| xNFT          |   ❌   |    ❌    | The `Xnft` program account of the master token being transferred                                 |
| Master Mint   |   ❌   |    ❌    | The master mint of the xNFT token account                                                        |
| Source        |   ❌   |    ✅    | The associated token account that currently holds the xNFT master token                          |
| Destination   |   ❌   |    ✅    | The associated token account that the master token should be transferred into                    |
| Recipient     |   ❌   |    ❌    | The account that is the authority of the destination associated token account                    |
| Authority     |   ✅   |    ✅    | The authority and current holder of the xNFT master token in the source associated token account |
| Token Program |   ❌   |    ❌    | ---                                                                                              |

### Arguments

!> None

---

## Update an xNFT

TODO:

### Accounts

| Name                   | Signer | Writable | Description                                                                                                                 |
| :--------------------- | :----: | :------: | :-------------------------------------------------------------------------------------------------------------------------- |
| xNFT                   |   ❌   |    ✅    | The `Xnft` program account being updated                                                                                    |
| Master Token           |   ❌   |    ❌    | The master token account of the xNFT to verify ownership                                                                    |
| Master Metadata        |   ❌   |    ✅    | The MPL master metadata account of the xNFT master mint                                                                     |
| Update Authority       |   ❌   |    ❌    | The account that acts as the xNFT's update gatekeeping authority - either the owner or the curator if assigned and verified |
| xNFT Authority         |   ✅   |    ❌    | The owner of the xNFT and it's master token                                                                                 |
| Token Metadata Program |   ❌   |    ❌    | ---                                                                                                                         |

### Arguments

| Name    | Type     | Description          |
| :------ | :------- | :------------------- |
| Updates | `struct` | Schema defined below |

#### Updates Struct

```rust
pub struct UpdateParams {
    install_vault: Option<Pubkey>,
    price: Option<u64>,
    supply: Option<SupplyType>,
    tag: Option<Tag>,
    uri: Option<String>,
}

pub enum SupplyType {
    Infinite,
    Limited { value: u64 },
}
```

---

## Verify the Curator of an xNFT

TODO:

### Accounts

| Name    | Signer | Writable | Description                                                        |
| :------ | :----: | :------: | :----------------------------------------------------------------- |
| xNFT    |   ❌   |    ✅    | The `Xnft` program account whose curator is being verified         |
| Curator |   ✅   |    ❌    | The account that is assigned as the unverified curator on the xNFT |

### Arguments

!> None
