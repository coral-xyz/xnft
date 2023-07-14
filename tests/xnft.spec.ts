import * as anchor from "@coral-xyz/anchor";
import {
  keypairIdentity,
  Metaplex,
  parseMetadataAccount,
  type UnparsedAccount,
  type MetadataAccount,
} from "@metaplex-foundation/js";
import { getAssociatedTokenAddressSync, getAccount } from "@solana/spl-token";
import { assert } from "chai";
import type { Xnft } from "../target/types/xnft";
import { deriveInstallAddress, deriveReviewAddress, deriveXnftAddress, PROGRAM_ID, xNFT } from "../typescript/src";
import { client, metadataProgram, wait } from "./common";

const curatorAuthority = anchor.web3.Keypair.generate();
const authority = ((client.provider as anchor.AnchorProvider).wallet as anchor.Wallet).payer;
const metaplex = new Metaplex(client.provider.connection).use(keypairIdentity(authority));

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
    await client.provider.connection.requestAirdrop(otherCreator.publicKey, anchor.web3.LAMPORTS_PER_SOL);
    await client.provider.connection.requestAirdrop(curatorAuthority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
  });

  describe("can be created", () => {
    const name = "test xnft";
    const tag = "defi";
    const uri = "https://arweave.net/abc123";

    let xnftData: anchor.IdlAccounts<Xnft>["xnft"];
    let meta: MetadataAccount;

    it("unless the uri is too long", async () => {
      try {
        await client.createAppXnft({
          creators: [{ address: authority.publicKey, share: 100 }],
          name,
          tag,
          uri: "this uri is obviously too long to fit into the metadata account...this uri is obviously too long to fit into the metadata account...this uri is obviously too long to fit into the metadata account...this uri is obviously too long to fit into the metadata account...",
        });

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "UriExceedsMaxLength");
      }
    });

    it("when the arguments are within the bounds", async () => {
      [masterMint] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("mint"), authority.publicKey.toBytes(), Buffer.from(name)],
        PROGRAM_ID
      );

      masterToken = getAssociatedTokenAddressSync(masterMint, authority.publicKey);
      [xnft] = deriveXnftAddress(masterMint);
      [masterMetadata] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), metadataProgram.toBytes(), masterMint.toBytes()],
        metadataProgram
      );

      await client.createAppXnft({
        creators: [
          { address: authority.publicKey, share: 50 },
          { address: otherCreator.publicKey, share: 50 },
        ],
        name,
        tag,
        uri,
      });

      xnftData = (await client.program.account.xnft.fetch(xnft)) as any;

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
      const acc = await getAccount(client.provider.connection, masterToken);
      assert.isTrue(acc.isFrozen);
    });
  });

  describe("a curator can be set on an xNFT", () => {
    it("when the user provides a valid curator account", async () => {
      await client.setCurator(xnft, masterToken, curatorAuthority.publicKey);
    });

    it("and the curator account is set but unverified", async () => {
      const data = await client.program.account.xnft.fetch(xnft);
      assert.strictEqual(data.curator.pubkey.toBase58(), curatorAuthority.publicKey.toBase58());
      assert.isFalse(data.curator.verified);
    });
  });

  describe("the curator on an xNFT can be verified", () => {
    it("unless the signer does not match the curator authority", async () => {
      try {
        await client.verify(xnft);
        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "CuratorMismatch");
      }
    });

    it("if the curator authority signs the transaction", async () => {
      const c = new xNFT(
        new anchor.AnchorProvider(client.provider.connection, new anchor.Wallet(curatorAuthority), {})
      );
      await c.verify(xnft);
    });

    it("and the xNFT curator data will show verified", async () => {
      const acc = await client.program.account.xnft.fetch(xnft);
      assert.isTrue(acc.curator.verified);
    });
  });

  describe("the curator on an xNFT can be unverified", () => {
    it("if the curator authority signs the transaction", async () => {
      const c = new xNFT(
        new anchor.AnchorProvider(client.provider.connection, new anchor.Wallet(curatorAuthority), {})
      );
      await c.unverify(xnft);
    });

    it("and the xNFT curator data will show unverified", async () => {
      const acc = await client.program.account.xnft.fetch(xnft);
      assert.isFalse(acc.curator.verified);
    });
  });

  describe("an Install can be created", () => {
    it("unless the xNFT is suspended", async () => {
      await client.setSuspended(xnft, masterMint, true);

      try {
        await client.install(xnft, installVault);
        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "SuspendedInstallation");
      } finally {
        await client.setSuspended(xnft, masterMint, false);
      }
    });

    it("when the xNFT is not currently suspended", async () => {
      [install] = deriveInstallAddress(client.provider.publicKey, xnft);
      await client.install(xnft, installVault);
    });

    it("and the total installs for the xNFT will be incremented", async () => {
      const acc = await client.program.account.xnft.fetch(xnft);
      assert.strictEqual(acc.totalInstalls.toNumber(), 1);
    });
  });

  describe("a Review can be created", () => {
    const c = new xNFT(new anchor.AnchorProvider(client.provider.connection, new anchor.Wallet(author), {}));

    before(async () => {
      await client.program.provider.connection.requestAirdrop(author.publicKey, anchor.web3.LAMPORTS_PER_SOL);

      await wait(750);

      [authorInstallation] = deriveInstallAddress(c.provider.publicKey, xnft);
      await c.install(xnft, installVault);
    });

    it("unless the signing wallet owns the xNFT", async () => {
      try {
        await client.review("https://google.com", 4, xnft, masterToken);
        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "CannotReviewOwned");
      }
    });

    // TODO: test install authority and xnft mismatches

    it("unless the install account authority does not match", async () => {
      try {
        await client.program.methods
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
        await c.review("https://google.com", 6, xnft, masterToken);
        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "RatingOutOfBounds");
      }
    });

    it("unless the provided rating is less than 1", async () => {
      try {
        await c.review("https://google.com", 0, xnft, masterToken);
        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "RatingOutOfBounds");
      }
    });

    it("when appropriate accounts and arguments", async () => {
      [review] = deriveReviewAddress(xnft, author.publicKey);
      await c.review("https://google.com", 4, xnft, masterToken);
    });

    it("and the xNFTs total rating and number of ratings should reflect it", async () => {
      const acc = await client.program.account.xnft.fetch(xnft);
      assert.strictEqual(acc.numRatings, 1);
      assert.strictEqual(acc.totalRating.toNumber(), 4);
    });
  });

  describe("users can donate to the creators of an xNFT", () => {
    const donator = anchor.web3.Keypair.generate();
    const tempClient = new xNFT(new anchor.AnchorProvider(client.provider.connection, new anchor.Wallet(donator), {}));

    let predonationAmount1: number;
    let predonationAmount2: number;

    before(async () => {
      await tempClient.provider.connection.requestAirdrop(donator.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
      await wait(750);
    });

    it("unless the accounts provided do not match the on-chain creators", async () => {
      try {
        const acc = await tempClient.program.account.xnft.fetch(xnft);

        await tempClient.program.methods
          .donate(new anchor.BN(10))
          .accounts({
            masterMetadata: acc.masterMetadata,
            xnft,
          })
          .remainingAccounts([
            { pubkey: anchor.web3.PublicKey.default, isSigner: false, isWritable: true },
            { pubkey: anchor.web3.PublicKey.default, isSigner: false, isWritable: true },
          ])
          .rpc();

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "UnknownCreator");
      }
    });

    it("when the accounts are the same as the metadata creators and in the same order", async () => {
      predonationAmount1 = (await client.provider.connection.getAccountInfo(authority.publicKey)).lamports;
      predonationAmount2 = (await client.provider.connection.getAccountInfo(otherCreator.publicKey)).lamports;
      await tempClient.donate(xnft, new anchor.BN(5 * anchor.web3.LAMPORTS_PER_SOL));
    });

    it("and the amount will be removed from the signer", async () => {
      const acc = await tempClient.provider.connection.getAccountInfo(donator.publicKey);
      assert.strictEqual(acc.lamports, 5 * anchor.web3.LAMPORTS_PER_SOL - 5000);
    });

    it("and the creator will receive the donation", async () => {
      const acc1 = await tempClient.provider.connection.getAccountInfo(authority.publicKey);
      assert.strictEqual(acc1.lamports, predonationAmount1 + 2.5 * anchor.web3.LAMPORTS_PER_SOL);

      const acc2 = await tempClient.provider.connection.getAccountInfo(otherCreator.publicKey);
      assert.strictEqual(acc2.lamports, predonationAmount2 + 2.5 * anchor.web3.LAMPORTS_PER_SOL);
    });
  });
});

describe("Account Updates", () => {
  const newAuthority = anchor.web3.Keypair.generate();

  before(async () => {
    await client.provider.connection.requestAirdrop(newAuthority.publicKey, anchor.web3.LAMPORTS_PER_SOL);
  });

  it("the data in an xNFT account can be updated by the owner", async () => {
    await client.update(
      masterMint,
      {
        installPrice: new anchor.BN(100),
        tag: "none",
        name: "new name",
        supply: new anchor.BN(200),
        uri: "new uri update",
      },
      curatorAuthority.publicKey
    );

    const acc = await client.program.account.xnft.fetch(xnft);
    assert.strictEqual(acc.installPrice.toNumber(), 100);
    assert.strictEqual(acc.supply.toNumber(), 200);
    assert.deepEqual(acc.tag, { none: {} });
    assert.strictEqual(acc.uri, "new uri update");

    const metaAcc = (await metaplex.rpc().getAccount(masterMetadata)) as UnparsedAccount;
    const meta = parseMetadataAccount(metaAcc);
    assert.strictEqual(meta.data.data.name.replace(/\0/g, ""), "new name");
    assert.strictEqual(meta.data.data.uri.replace(/\0/g, ""), "new uri update");
    assert.isTrue(meta.data.primarySaleHappened);
  });

  it("an xNFT can be transferred to another authority", async () => {
    const destination = getAssociatedTokenAddressSync(masterMint, newAuthority.publicKey);

    await client.transfer(xnft, masterMint, newAuthority.publicKey);

    const ata = await getAccount(client.provider.connection, destination);
    assert.strictEqual(ata.amount.toString(), "1");
    assert.isTrue(ata.isFrozen);
    assert.strictEqual(ata.mint.toBase58(), masterMint.toBase58());
    assert.strictEqual(ata.owner.toBase58(), newAuthority.publicKey.toBase58());

    const oldAta = await client.provider.connection.getAccountInfo(masterToken);
    assert.isNull(oldAta);
  });
});

describe("Account Closure", () => {
  const c = new xNFT(new anchor.AnchorProvider(client.provider.connection, new anchor.Wallet(author), {}));

  it("an Install can be deleted by the authority", async () => {
    await c.uninstall(xnft, author.publicKey);
    const acc = await client.program.account.install.fetchNullable(authorInstallation);
    assert.isNull(acc);
  });

  it("a Review can be delete by the author", async () => {
    await c.deleteReview(review, author.publicKey);
    const acc = await client.program.account.review.fetchNullable(review);
    assert.isNull(acc);
  });
});
