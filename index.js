const { web3, Program, AnchorProvider, Spl } = require('@project-serum/anchor')
const IDL = require('./target/idl/xnft.json')

const programId = new web3.PublicKey('BdbULx4sJSeLJzvR6h6QxL4fUPJAJw86qmwwXt6jBfXd')
const connection = new web3.Connection('https://solana-api.projectserum.com')
const provider = new AnchorProvider(
  connection,
  { publicKey: web3.PublicKey.default }
)

const program = new Program(IDL, programId, provider)
const SplToken = Spl.token(program.provider)
const authority = new web3.PublicKey('3D7fBGrTuRswqbc3hJYVaDpKkPCVJ4392HWd6r27997p')

program.provider.connection.getProgramAccounts(
  SplToken.programId,
  {
    filters: [
      {
        dataSize: SplToken.account.token.size,
      },
      {
        memcmp: {
          offset: 32,
          bytes: authority.toBase58(),
        }
      }
    ]
  }
)
  .then(accs => {
    for (const a of accs) {
      console.log(a.pubkey.toBase58())
      const t = SplToken.coder.accounts.decode('token', a.account.data)
      console.log(t.mint.toBase58())
    }
  })
  .catch(console.error)
