import { PublicKey } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { assert } from 'chai';
import { Xnft } from '../target/types/xnft';

const metadataProgram = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('xnft', async () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Xnft as Program<Xnft>;

  let xnft: PublicKey;
  let install: PublicKey;
  const installVault = program.provider.publicKey;
  const author = anchor.web3.Keypair.generate();

  before(async () => {
    await program.provider.connection.requestAirdrop(
      author.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );

    await wait(500);
  });

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
    const fetchedXnft = await program.account.xnft.fetch(xnft);
    assert.equal(fetchedXnft.name, 'my-xnft');
  });

  describe('a user can create an installation of an xnft', () => {
    it('by calling the `create_install` instruction', async () => {
      const tx = program.methods
        .createInstall()
        .accounts({
          xnft,
          installVault,
          authority: author.publicKey
        })
        .signers([author]);

      const keys = await tx.pubkeys();
      install = keys.install;

      await tx.rpc();
    });

    it('and can be fetched by installation authority', async () => {
      const installedxNFTs = await program.account.install.all([
        {
          memcmp: {
            offset: 8, // Discriminator
            bytes: author.publicKey.toBase58()
          }
        }
      ]);

      assert.isNotEmpty(installedxNFTs);
    });
  });

  describe('reviews can be created for an xNFT', () => {
    it('unless you currently own it', async () => {
      const tx = program.methods.createInstall().accounts({
        xnft,
        installVault
      });
      const pubkeys = await tx.pubkeys();
      await tx.rpc();

      try {
        await program.methods
          .createReview('https://arweave.net/abc123', 3)
          .accounts({
            install: pubkeys.install,
            xnft
          })
          .rpc();
        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, 'CannotReviewOwned');
      }
    });

    it('the rating cannot be larger than 5', async () => {
      try {
        await program.methods
          .createReview('https://arweave.net/abc123', 6)
          .accounts({
            author: author.publicKey,
            install,
            xnft
          })
          .signers([author])
          .rpc();
        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, 'RatingOutOfBounds');
      }
    });

    it('will succeed if properly formed', async () => {
      await program.methods
        .createReview('https://arweave.net/abc123', 4)
        .accounts({
          author: author.publicKey,
          install,
          xnft
        })
        .signers([author])
        .rpc();

      const reviews = await program.account.review.all();
      assert.lengthOf(reviews, 1);
      assert.strictEqual(reviews[0].account.uri, 'https://arweave.net/abc123');
      assert.strictEqual(reviews[0].account.rating, 4);
    });

    it('the rating data on the xnft account will be updated', async () => {
      const acc = await program.account.xnft.fetch(xnft);
      assert.strictEqual(acc.totalRating.toNumber(), 4);
      assert.strictEqual(acc.numRatings, 1);
    });
  });

  describe('an installation can be removed by a user', () => {
    it('with the `delete_install` instruction', async () => {
      await program.methods
        .deleteInstall()
        .accounts({ install, receiver: author.publicKey, authority: author.publicKey })
        .signers([author])
        .rpc();
    });

    it('the install would return null on a fetch', async () => {
      const i = await program.account.install.fetchNullable(install);
      assert.isNull(i);
    });
  });

  it('fetch xnfts owned by user', async () => {
    const ownedxNFTs = await program.account.xnft.all([
      {
        memcmp: {
          offset: 8, // Discriminator
          bytes: program.provider.publicKey.toBase58()
        }
      }
    ]);

    assert.isNotEmpty(ownedxNFTs);
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

      const acc = await program.account.xnft.fetch(xnft);
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
      const x = await program.account.xnft.fetch(xnft);
      await program.methods
        .updateXnft({
          installVault: null,
          name: null,
          price: null,
          tag: { nft: {} } as never,
          uri: 'https://backpack.app'
        })
        .accounts({ xnft, masterMetadata: x.masterMetadata, metadataProgram })
        .rpc();
    });

    it('and it will change the xnft program account', async () => {
      const x = await program.account.xnft.fetch(xnft);
      assert.deepEqual(x.tag, { nft: {} });

      const m = await Metadata.fromAccountAddress(program.provider.connection, x.masterMetadata);
      assert.equal('https://backpack.app', m.data.uri.replace(/\0/g, ''));
    });

    it('the updated timestamp will be changed', async () => {
      const x = await program.account.xnft.fetch(xnft);
      assert.isTrue(x.createdTs.toNumber() < x.updatedTs.toNumber());
    });
  });
});
