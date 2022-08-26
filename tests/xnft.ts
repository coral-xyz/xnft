import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import * as anchor from '@project-serum/anchor';
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

let xnft: anchor.web3.PublicKey;
let metadataAccount: anchor.web3.PublicKey;
let install: anchor.web3.PublicKey;
let authorInstallation: anchor.web3.PublicKey;

describe('Account Creations', () => {
  describe('an xNFT can be created', () => {
    const price = new anchor.BN(0);
    const name = 'test xnft';
    const symbol = '';
    const tag = { defi: {} };
    const kind = { app: {} };
    const uri = 'https://arweave.net/abc123';
    const sellerFeeBasisPoints = 0;
    const supply = new anchor.BN(100);

    it('unless the name is too long', async () => {
      try {
        await program.methods
          .createXnft(
            'this title is way too long use!',
            symbol,
            tag,
            kind,
            uri,
            sellerFeeBasisPoints,
            price,
            installVault,
            supply
          )
          .accounts({
            metadataProgram
          })
          .rpc();

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, 'NameTooLong');
      }
    });

    it('when the arguments are within the bounds', async () => {
      const tx = program.methods
        .createXnft(name, symbol, tag, kind, uri, sellerFeeBasisPoints, price, installVault, supply)
        .accounts({
          metadataProgram
        });

      const pubkeys = await tx.pubkeys();
      await tx.rpc();

      const accs = await program.account.xnft.all();
      assert.lengthOf(accs, 1);

      xnft = pubkeys.xnft;
      metadataAccount = pubkeys.masterMetadata;
    });

    it('and the supply will be translated to the MPL metadata', async () => {
      const meta = await Metadata.fromAccountAddress(program.provider.connection, metadataAccount);
      assert.strictEqual(meta.collectionDetails.size.toString(), supply.toString());
    });
  });

  describe('an Install can be created', () => {
    it('unless the xNFT is suspended', async () => {
      await program.methods.setSuspended(true).accounts({ xnft }).rpc();

      try {
        await program.methods
          .createInstall()
          .accounts({
            xnft,
            installVault
          })
          .rpc();

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, 'SuspendedInstallation');
      } finally {
        await program.methods.setSuspended(false).accounts({ xnft }).rpc();
      }
    });

    it('when the xNFT is not currently suspended', async () => {
      const tx = program.methods.createInstall().accounts({
        xnft,
        installVault
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
        .accounts({ xnft, installVault, authority: author.publicKey })
        .signers([author]);
      const installKeys = await installTx.pubkeys();
      await installTx.rpc();
      authorInstallation = installKeys.install;
    });

    it('unless the signing wallet owns the xNFT', async () => {
      try {
        await program.methods
          .createReview('https://google.com', 4)
          .accounts({ install, xnft })
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
          .accounts({ install, xnft, author: author.publicKey })
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
          .accounts({ install: authorInstallation, xnft, author: author.publicKey })
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
        .accounts({ install: authorInstallation, xnft, author: author.publicKey })
        .signers([author])
        .rpc();

      const accs = await program.account.review.all();
      assert.lengthOf(accs, 1);
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
        masterMetadata: metadataAccount,
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
});
