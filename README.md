<div align="center">
  <img style="margin-bottom:15px" src="./.github/logo.svg" height="80px" />
  <h1><strong>xNFT</strong></h1>
  <p>
    <strong>A protocol for minting and managing executable NFTs</strong>
  </p>
  <p>
    <a href="https://github.com/coral-xyz/xnft/actions"><img alt="Build Status" src="https://github.com/coral-xyz/xnft/actions/workflows/test.yaml/badge.svg" /></a>
    <a target="_blank" href="https://discord.gg/backpack"><img alt="Discord Chat" src="https://img.shields.io/badge/chat-discord-blueviolet" /></a>
    <a target="_blank" href="https://github.com/coral-xyz/xnft/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/github/license/coral-xyz/xnft?color=red" /></a>
    <a target="_blank" href="https://coral-xyz.github.io/xnft"><img alt="Docs" src="https://img.shields.io/badge/docs-protocol-blue" /></a>
  </p>
</div>

## Disclaimer

- This protocol is under active development and is subject to change
- The contract code is currently unaudited

## Developing

### Install Anchor

If you do not have the Anchor dev tools installed, do that first by following [the installation guide](https://www.anchor-lang.com/docs/installation).

### Build Dependencies

```
make dependencies
```

### Build the xNFT Program

```
anchor build
```

### Testing

```
cargo clippy --all-targets -- -D warnings
anchor test
```
