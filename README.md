# xNFT

## Developing

### Install Anchor

First install the Anchor dev tools. See [book.anchor-lang.com](https://book.anchor-lang.com).

### Installing and building submodules

Then, install and build all submodules.

```bash
make bootstrap
```

### Building

To build the program, run

```bash
anchor build
```

### Testing

To test the program, run

```bash
anchor test
```

### Localnet

To run a localnet with all the required programs deployed, first build and then run

```bash
anchor localnet
```
