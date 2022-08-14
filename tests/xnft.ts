import { PublicKey } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { assert } from 'chai';
import { Xnft } from '../target/types/xnft';

const metadataProgram = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('xnft', () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Xnft as Program<Xnft>;

  let xnft: PublicKey;
  // let install: PublicKey;
  const installVault = program.provider.publicKey;

  it('creates the xNFT', async () => {
    const installPrice = new anchor.BN(0);
    const name = 'my-xnft';
    const symbol = '';
    const tag = { defi: {} };
    const kind = { app: {} };
    const uri =
      'https://xnfts-dev.s3.us-west-2.amazonaws.com/DigDvhGGe29L6PWd3a42GJpDJV8WqSS2CTaeNzpH8QnK/Mango+Swap/metadata.json';
    const seller_fee_basis_points = 1;
    const supply = new anchor.BN(100);

    const tx = program.methods
      .createXnft(
        name,
        symbol,
        tag,
        kind,
        uri,
        seller_fee_basis_points,
        installPrice,
        installVault,
        supply
      )
      .accounts({
        metadataProgram
      });

    await tx.rpc();
    const pubkeys = await tx.pubkeys();

    xnft = pubkeys.xnft;
  });

  it('fetch created xNFT', async () => {
    const fetchedXnft = await program.account.xnft2.fetch(xnft);
    assert.equal(fetchedXnft.name, 'my-xnft');
  });

  it("installs an xNFT into the user's wallet", async () => {
    const tx = program.methods.createInstall().accounts({
      xnft,
      installVault
    });

    await tx.rpc();

    // const pubkeys = await tx.pubkeys();
    // install = pubkeys.install;
  });

  it('fetch xnfts owned by user', async () => {
    const ownedxNFTs = await program.account.xnft2.all([
      {
        memcmp: {
          offset: 8, // Discriminator
          bytes: program.provider.publicKey.toBase58()
        }
      }
    ]);

    assert.isNotEmpty(ownedxNFTs);
  });

  it('fetch user installed xNFTs', async () => {
    const installedxNFTs = await program.account.install.all([
      {
        memcmp: {
          offset: 8, // Discriminator
          bytes: program.provider.publicKey.toBase58()
        }
      }
    ]);

    assert.isNotEmpty(installedxNFTs);
  });

  describe('if the authority was to stop installations of their xnft', () => {
    after(async () => {
      await program.methods.setSuspended(false).accounts({ xnft }).rpc();
    });

    it('they can suspend the xnft', async () => {
      await program.methods
        .setSuspended(true)
        .accounts({
          xnft
        })
        .rpc();

      const acc = await program.account.xnft2.fetch(xnft);
      assert.isTrue(acc.suspended);
    });

    it('this will prevent users from installing', async () => {
      const installer = anchor.web3.Keypair.generate();
      await program.provider.connection.requestAirdrop(
        installer.publicKey,
        1 * anchor.web3.LAMPORTS_PER_SOL
      );

      await wait(500);

      try {
        await program.methods
          .createInstall()
          .accounts({
            xnft,
            installVault,
            authority: installer.publicKey
          })
          .signers([installer])
          .rpc();
        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, 'SuspendedInstallation');
      }
    });
  });

  describe('the authority of an xnft can update the properties', () => {
    it('by using the `update_xnft` instruction', async () => {
      const x = await program.account.xnft2.fetch(xnft);
      await program.methods
        .updateXnft({
          installVault: null,
          price: null,
          tag: { nft: {} } as never,
          uri: 'https://backpack.app'
        })
        .accounts({ xnft, masterMetadata: x.masterMetadata, metadataProgram })
        .rpc();
    });

    it('and it will change the xnft program account', async () => {
      const x = await program.account.xnft2.fetch(xnft);
      assert.deepEqual(x.tag, { nft: {} });

      const m = await Metadata.fromAccountAddress(program.provider.connection, x.masterMetadata);
      assert.equal('https://backpack.app', m.data.uri.replace(/\0/g, ''));
    });
  });
});
