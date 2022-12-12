import {
  keypairIdentity,
  Metaplex,
  parseMetadataAccount,
  type UnparsedAccount,
  type MetadataAccount,
} from "@metaplex-foundation/js";
import * as anchor from "@project-serum/anchor";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { assert } from "chai";
import type { Xnft } from "../target/types/xnft";
import { metadataProgram, program, wait } from "./common";

const curatorAuthority = anchor.web3.Keypair.generate();
const authority = ((program.provider as anchor.AnchorProvider).wallet as anchor.Wallet).payer;
const metaplex = new Metaplex(program.provider.connection).use(keypairIdentity(authority));

const installVault = authority.publicKey;
const author = anchor.web3.Keypair.generate();
const otherCreator = anchor.web3.Keypair.generate();

let xnft: anchor.web3.PublicKey;
let masterMetadata: anchor.web3.PublicKey;
let masterMint: anchor.web3.PublicKey;
let masterToken: anchor.web3.PublicKey;
let install: anchor.web3.PublicKey;
let review: anchor.web3.PublicKey;
let authorInstallation: anchor.web3.PublicKey;

describe("A standard xNFT", () => {
  before(async () => {
    await program.provider.connection.requestAirdrop(curatorAuthority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
  });

  describe("can be created", () => {
    const installPrice = new anchor.BN(0);
    const name = "test xnft";
    const symbol = "";
    const tag = { defi: {} } as never;
    const uri = "https://arweave.net/abc123";
    const sellerFeeBasisPoints = 0;
    const supply = null;

    let xnftData: anchor.IdlAccounts<Xnft>["xnft"];
    let meta: MetadataAccount;

    it("unless the uri is too long", async () => {
      const [mint] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("mint"), authority.publicKey.toBytes(), Buffer.from(name)],
        program.programId
      );

      const masterToken = await getAssociatedTokenAddress(mint, authority.publicKey);

      try {
        await program.methods
          .createXnft(name, {
            symbol,
            tag,
            uri: "this sample uri is too long according to metaplex and should break the serialization of the accounts + this sample uri is too long according to metaplex and should break the serialization of the accounts",
            sellerFeeBasisPoints,
            installAuthority: null,
            installPrice,
            installVault,
            supply,
            creators: [{ address: authority.publicKey, share: 100 }],
            curator: null,
          })
          .accounts({ masterMint: mint, masterToken, metadataProgram })
          .rpc();

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "UriExceedsMaxLength");
      }
    });

    it("when the arguments are within the bounds", async () => {
      [masterMint] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("mint"), authority.publicKey.toBytes(), Buffer.from(name)],
        program.programId
      );

      masterToken = await getAssociatedTokenAddress(masterMint, authority.publicKey);

      const ix = program.methods
        .createXnft(name, {
          symbol,
          tag,
          uri,
          sellerFeeBasisPoints,
          installAuthority: null,
          installPrice,
          installVault,
          supply,
          creators: [
            { address: authority.publicKey, share: 50 },
            { address: otherCreator.publicKey, share: 50 },
          ],
          curator: null,
        })
        .accounts({
          masterMint,
          payer: authority.publicKey,
          publisher: authority.publicKey,
          masterToken,
          metadataProgram,
        });

      const pubkeys = await ix.pubkeys();
      await ix.rpc();

      xnft = pubkeys.xnft;
      xnftData = (await program.account.xnft.fetch(xnft)) as any;
      masterMetadata = pubkeys.masterMetadata;

      const acc = (await metaplex.rpc().getAccount(masterMetadata)) as UnparsedAccount;
      meta = parseMetadataAccount(acc);
    });

    it("and the curator is null when not provided on creation", () => {
      assert.isNull(xnftData.curator);
    });

    it("and the creators are set in the metadata", () => {
      assert.lengthOf(meta.data.data.creators, 2);
      assert.strictEqual(meta.data.data.creators[0].address.toBase58(), authority.publicKey.toBase58());
      assert.isTrue(meta.data.data.creators[0].verified);
      assert.strictEqual(meta.data.data.creators[1].address.toBase58(), otherCreator.publicKey.toBase58());
      assert.isFalse(meta.data.data.creators[1].verified);
    });

    it("and the publisher is verified", () => {
      assert.strictEqual(meta.data.data.creators[0].address.toBase58(), authority.publicKey.toBase58());
      assert.isTrue(meta.data.data.creators[0].verified);
    });

    it("and the metadata is marked with the primary sale already happened", () => {
      assert.isTrue(meta.data.primarySaleHappened);
    });

    it("and the token account is frozen after the mint", async () => {
      const acc = await getAccount(program.provider.connection, masterToken);
      assert.isTrue(acc.isFrozen);
    });
  });

  describe("a curator can be set on an xNFT", () => {
    it("when the user provides a valid curator account", async () => {
      await program.methods
        .setCurator()
        .accounts({
          xnft,
          masterToken,
          curator: curatorAuthority.publicKey,
        })
        .rpc();
    });

    it("and the curator account is set but unverified", async () => {
      const data = await program.account.xnft.fetch(xnft);
      assert.strictEqual(data.curator.pubkey.toBase58(), curatorAuthority.publicKey.toBase58());
      assert.isFalse(data.curator.verified);
    });
  });

  describe("the curator on an xNFT can be verified", () => {
    it("unless the signer does not match the curator authority", async () => {
      try {
        await program.methods
          .verifyCurator()
          .accounts({
            xnft,
            curator: curatorAuthority.publicKey,
          })
          .rpc();
        assert.ok(false);
      } catch (_err) {}
    });

    it("if the curator authority signs the transaction", async () => {
      await program.methods
        .verifyCurator()
        .accounts({
          xnft,
          curator: curatorAuthority.publicKey,
        })
        .signers([curatorAuthority])
        .rpc();
    });

    it("and the xNFT curator data will show verified", async () => {
      const acc = await program.account.xnft.fetch(xnft);
      assert.isTrue(acc.curator.verified);
    });
  });

  describe("an Install can be created", () => {
    it("unless the xNFT is suspended", async () => {
      await program.methods.setSuspended(true).accounts({ xnft, masterToken }).rpc();

      try {
        await program.methods
          .createInstall()
          .accounts({
            xnft,
            installVault,
          })
          .rpc();

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "SuspendedInstallation");
      } finally {
        await program.methods.setSuspended(false).accounts({ xnft, masterToken }).rpc();
      }
    });

    it("when the xNFT is not currently suspended", async () => {
      const tx = program.methods.createInstall().accounts({
        xnft,
        installVault,
      });

      const pubkeys = await tx.pubkeys();
      await tx.rpc();

      install = pubkeys.install;
    });

    it("and the total installs for the xNFT will be incremented", async () => {
      const acc = await program.account.xnft.fetch(xnft);
      assert.strictEqual(acc.totalInstalls.toNumber(), 1);
    });
  });

  describe("a Review can be created", () => {
    before(async () => {
      await program.provider.connection.requestAirdrop(author.publicKey, anchor.web3.LAMPORTS_PER_SOL);

      await wait(500);

      const installTx = program.methods
        .createInstall()
        .accounts({
          xnft,
          installVault,
          target: author.publicKey,
          authority: author.publicKey,
        })
        .signers([author]);
      const installKeys = await installTx.pubkeys();
      await installTx.rpc();
      authorInstallation = installKeys.install;
    });

    it("unless the signing wallet owns the xNFT", async () => {
      try {
        await program.methods.createReview("https://google.com", 4).accounts({ install, xnft, masterToken }).rpc();

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "CannotReviewOwned");
      }
    });

    // TODO: test install authority and xnft mismatches

    it("unless the Install account authority does not match", async () => {
      try {
        await program.methods
          .createReview("https://google.com", 4)
          .accounts({ install, xnft, author: author.publicKey, masterToken })
          .signers([author])
          .rpc();

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "InstallOwnerMismatch");
      }
    });

    it("unless the provided rating is greater than 5", async () => {
      try {
        await program.methods
          .createReview("https://google.com", 6)
          .accounts({
            install: authorInstallation,
            xnft,
            author: author.publicKey,
            masterToken,
          })
          .signers([author])
          .rpc();

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "RatingOutOfBounds");
      }
    });

    it("when appropriate accounts and arguments", async () => {
      await program.methods
        .createReview("https://google.com", 4)
        .accounts({
          install: authorInstallation,
          xnft,
          author: author.publicKey,
          masterToken,
        })
        .signers([author])
        .rpc();

      const accs = await program.account.review.all();
      assert.lengthOf(accs, 1);
      review = accs[0].publicKey;
    });

    it("and the xNFTs total rating and number of ratings should reflect it", async () => {
      const acc = await program.account.xnft.fetch(xnft);
      assert.strictEqual(acc.numRatings, 1);
      assert.strictEqual(acc.totalRating.toNumber(), 4);
    });
  });
});

describe("Account Updates", () => {
  const newAuthority = anchor.web3.Keypair.generate();

  before(async () => {
    await program.provider.connection.requestAirdrop(newAuthority.publicKey, anchor.web3.LAMPORTS_PER_SOL);
  });

  it("the data in an xNFT account can be updated by the owner", async () => {
    await program.methods
      .updateXnft({
        installAuthority: null,
        installPrice: new anchor.BN(100),
        installVault,
        supply: new anchor.BN(200),
        tag: { none: {} } as never,
        uri: "new uri update",
      })
      .accounts({
        xnft,
        masterMetadata,
        masterToken,
        updater: authority.publicKey,
        curationAuthority: curatorAuthority.publicKey,
        metadataProgram,
      })
      .rpc();

    const acc = await program.account.xnft.fetch(xnft);

    assert.strictEqual(acc.installPrice.toNumber(), 100);
    assert.strictEqual(acc.supply.toNumber(), 200);
    assert.deepEqual(acc.tag, { none: {} });
    assert.strictEqual(acc.uri, "new uri update");
  });

  it("an xNFT can be transferred to another authority", async () => {
    const destination = await getAssociatedTokenAddress(masterMint, newAuthority.publicKey);

    await program.methods
      .transfer()
      .accounts({
        xnft,
        masterMint,
        source: masterToken,
        destination,
        recipient: newAuthority.publicKey,
      })
      .rpc();

    const ata = await getAccount(program.provider.connection, destination);
    assert.strictEqual(ata.amount.toString(), "1");
    assert.isTrue(ata.isFrozen);
    assert.strictEqual(ata.mint.toBase58(), masterMint.toBase58());
    assert.strictEqual(ata.owner.toBase58(), newAuthority.publicKey.toBase58());

    const oldAta = await program.provider.connection.getAccountInfo(masterToken);
    assert.isNull(oldAta);
  });

  after(async () => {});
});

describe("Account Closure", () => {
  it("an Install can be deleted by the authority", async () => {
    await program.methods
      .deleteInstall()
      .accounts({
        install: authorInstallation,
        receiver: author.publicKey,
        authority: author.publicKey,
      })
      .signers([author])
      .rpc();

    const acc = await program.account.install.fetchNullable(authorInstallation);
    assert.isNull(acc);
  });

  it("a Review can be delete by the author", async () => {
    await program.methods
      .deleteReview()
      .accounts({
        review,
        xnft,
        receiver: author.publicKey,
        author: author.publicKey,
      })
      .signers([author])
      .rpc();

    const acc = await program.account.review.fetchNullable(review);
    assert.isNull(acc);
  });
});
