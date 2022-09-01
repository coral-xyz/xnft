const { Metadata } = require('@metaplex-foundation/mpl-token-metadata')
const { Program, AnchorProvider, web3} = require('@project-serum/anchor')
const IDL = require('./target/idl/xnft.json')

const p = new Program(IDL, new web3.PublicKey('BdbULx4sJSeLJzvR6h6QxL4fUPJAJw86qmwwXt6jBfXd'), new AnchorProvider(new web3.Connection('https://api.devnet.solana.com'), { publicKey: web3.PublicKey.default }))
p.account.xnft.fetch('7gkWdXcZrndKhJNJ2ySoe2D6Xh3hhEatnkcxEpLojzpz')
  .then(async acc => {
    console.log(acc.masterMetadata.toBase58())
    const m = await Metadata.fromAccountAddress(p.provider.connection, acc.masterMetadata)
    console.log(m)
  })
  .catch(console.error)
