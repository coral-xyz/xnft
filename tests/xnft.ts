import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import * as anchor from '@project-serum/anchor';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { assert } from 'chai';
import type { Xnft } from '../target/types/xnft';

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const metadataProgram = new anchor.web3.PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

const program = anchor.workspace.Xnft as anchor.Program<Xnft>;
const authority = ((program.provider as anchor.AnchorProvider).wallet as NodeWallet).payer;
const installVault = authority.publicKey;
const author = anchor.web3.Keypair.generate();
const otherCreator = anchor.web3.Keypair.generate();

let xnft: anchor.web3.PublicKey;
let masterMetadata: anchor.web3.PublicKey;
let masterToken: anchor.web3.PublicKey;
let install: anchor.web3.PublicKey;
let review: anchor.web3.PublicKey;
let authorInstallation: anchor.web3.PublicKey;

describe('Account Creations', () => {
  describe('an xNFT can be created', () => {
    const installPrice = new anchor.BN(0);
    const name = 'test xnft';
    const symbol = '';
    const tag = { defi: {} } as never;
    const kind = { app: {} } as never;
    const uri = 'https://arweave.net/abc123';
    const sellerFeeBasisPoints = 0;
    const supply = new anchor.BN(100);
    const l1 = { solana: {} } as never;
    const collection = anchor.web3.Keypair.generate().publicKey;

    let meta: Metadata;

    it('unless the name is too long', async () => {
      const badName = 'this title is way too long use!';

      const [mint] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from('mint'), authority.publicKey.toBytes(), Buffer.from(badName)],
        program.programId
      );

      const masterToken = await getAssociatedTokenAddress(mint, authority.publicKey);

      try {
        await program.methods
          .createXnft(badName, {
            symbol,
            tag,
            kind,
            uri,
            sellerFeeBasisPoints,
            installPrice,
            installVault,
            supply,
            l1,
            collection: null,
            creators: [{ address: authority.publicKey, share: 100 }]
          })
          .accounts({ masterToken, metadataProgram })
          .rpc();

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, 'NameTooLong');
      }
    });

    it('when the arguments are within the bounds', async () => {
      const [mint] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from('mint'), authority.publicKey.toBytes(), Buffer.from(name)],
        program.programId
      );

      masterToken = await getAssociatedTokenAddress(mint, authority.publicKey);

      const tx = program.methods
        .createXnft(name, {
          symbol,
          tag,
          kind,
          uri,
          sellerFeeBasisPoints,
          installPrice,
          installVault,
          supply,
          l1,
          collection,
          creators: [
            { address: authority.publicKey, share: 50 },
            { address: otherCreator.publicKey, share: 50 }
          ]
        })
        .accounts({
          masterToken,
          metadataProgram
        });

      const pubkeys = await tx.pubkeys();
      await tx.rpc();

      const accs = await program.account.xnft.all();
      assert.lengthOf(accs, 1);

      xnft = pubkeys.xnft;
      masterMetadata = pubkeys.masterMetadata;
      meta = await Metadata.fromAccountAddress(program.provider.connection, masterMetadata);
    });

    it('and the creators are set in the metadata', () => {
      assert.lengthOf(meta.data.creators, 2);
      assert.strictEqual(meta.data.creators[0].address.toBase58(), authority.publicKey.toBase58());
      assert.isTrue(meta.data.creators[0].verified);
      assert.strictEqual(
        meta.data.creators[1].address.toBase58(),
        otherCreator.publicKey.toBase58()
      );
      assert.isFalse(meta.data.creators[1].verified);
    });

    it('and the publisher is verified', () => {
      assert.strictEqual(meta.data.creators[0].address.toBase58(), authority.publicKey.toBase58());
      assert.isTrue(meta.data.creators[0].verified);
    });

    it('and the collection public key can be attached but not verified', () => {
      assert.strictEqual(meta.collection.key.toBase58(), collection.toBase58());
      assert.isFalse(meta.collection.verified);
    });

    it('and the metadata is marked with the primary sale already happened', () => {
      assert.isTrue(meta.primarySaleHappened);
    });

    it('and the token account is frozen after the mint', async () => {
      const acc = await getAccount(program.provider.connection, masterToken);
      assert.isTrue(acc.isFrozen);
    });
  });

  describe('an Install can be created', () => {
    it('unless the xNFT is suspended', async () => {
      await program.methods.setSuspended(true).accounts({ xnft, masterToken }).rpc();

      try {
        await program.methods
          .createInstall()
          .accounts({
            xnft,
            installVault,
            masterMetadata
          })
          .rpc();

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, 'SuspendedInstallation');
      } finally {
        await program.methods.setSuspended(false).accounts({ xnft, masterToken }).rpc();
      }
    });

    it('when the xNFT is not currently suspended', async () => {
      const tx = program.methods.createInstall().accounts({
        xnft,
        installVault,
        masterMetadata
      });

      const pubkeys = await tx.pubkeys();
      await tx.rpc();

      const accs = await program.account.install.all();
      assert.lengthOf(accs, 1);

      install = pubkeys.install;
    });

    it('and the total installs for the xNFT will be incremented', async () => {
      const acc = await program.account.xnft.fetch(xnft);
      assert.strictEqual(acc.totalInstalls.toNumber(), 1);
    });
  });

  describe('a Review can be created', () => {
    before(async () => {
      await program.provider.connection.requestAirdrop(
        author.publicKey,
        anchor.web3.LAMPORTS_PER_SOL
      );

      await wait(500);

      const installTx = program.methods
        .createInstall()
        .accounts({ xnft, installVault, masterMetadata, authority: author.publicKey })
        .signers([author]);
      const installKeys = await installTx.pubkeys();
      await installTx.rpc();
      authorInstallation = installKeys.install;
    });

    it('unless the signing wallet owns the xNFT', async () => {
      try {
        await program.methods
          .createReview('https://google.com', 4)
          .accounts({ install, xnft, masterToken })
          .rpc();

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, 'CannotReviewOwned');
      }
    });

    // TODO: test install authority and xnft mismatches

    it('unless the Install account authority does not match', async () => {
      try {
        await program.methods
          .createReview('https://google.com', 4)
          .accounts({ install, xnft, author: author.publicKey, masterToken })
          .signers([author])
          .rpc();

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, 'InstallAuthorityMismatch');
      }
    });

    it('unless the provided rating is greater than 5', async () => {
      try {
        await program.methods
          .createReview('https://google.com', 6)
          .accounts({ install: authorInstallation, xnft, author: author.publicKey, masterToken })
          .signers([author])
          .rpc();

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, 'RatingOutOfBounds');
      }
    });

    it('when appropriate accounts and arguments', async () => {
      await program.methods
        .createReview('https://google.com', 4)
        .accounts({ install: authorInstallation, xnft, author: author.publicKey, masterToken })
        .signers([author])
        .rpc();

      const accs = await program.account.review.all();
      assert.lengthOf(accs, 1);
      review = accs[0].publicKey;
    });

    it('and the xNFTs total rating and number of ratings should reflect it', async () => {
      const acc = await program.account.xnft.fetch(xnft);
      assert.strictEqual(acc.numRatings, 1);
      assert.strictEqual(acc.totalRating.toNumber(), 4);
    });
  });
});

describe('Account Updates', () => {
  it('the data in an xNFT account can be updated by the owner', async () => {
    await program.methods
      .updateXnft({
        installVault: null,
        name: null,
        price: new anchor.BN(100),
        tag: { none: {} } as never,
        uri: null
      })
      .accounts({
        xnft,
        masterMetadata,
        masterToken,
        metadataProgram
      })
      .rpc();

    const acc = await program.account.xnft.fetch(xnft);

    assert.strictEqual(acc.installPrice.toNumber(), 100);
    assert.deepEqual(acc.tag, { none: {} });
  });
});

describe('Account Closure', () => {
  it('an Install can be deleted by the authority', async () => {
    await program.methods
      .deleteInstall()
      .accounts({
        install: authorInstallation,
        receiver: author.publicKey,
        authority: author.publicKey
      })
      .signers([author])
      .rpc();

    const acc = await program.account.install.fetchNullable(authorInstallation);
    assert.isNull(acc);
  });

  it('a Review can be delete by the author', async () => {
    await program.methods
      .deleteReview()
      .accounts({
        review,
        xnft,
        receiver: author.publicKey,
        author: author.publicKey
      })
      .signers([author])
      .rpc();

    const acc = await program.account.review.fetchNullable(review);
    assert.isNull(acc);
  });
});
