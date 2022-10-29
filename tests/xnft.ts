// Copyright (C) 2022 Blue Coral, Inc.

import {
  keypairIdentity,
  Metaplex,
  parseMetadataAccount,
  type UnparsedAccount,
  type MetadataAccount,
} from "@metaplex-foundation/js";
import * as anchor from "@project-serum/anchor";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { assert } from "chai";
import type { Xnft } from "../target/types/xnft";
import {
  IDL,
  type CoralMultisig,
} from "../deps/multisig/target/types/coral_multisig";

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const multisigProgramId = new anchor.web3.PublicKey(
  "msigUdDBsR4zSUYqYEDrc1LcgtmuSDDM7KxpRUXNC6U"
);

export const metadataProgram = new anchor.web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const program = anchor.workspace.Xnft as anchor.Program<Xnft>;
const multisigProgram = new anchor.Program<CoralMultisig>(
  IDL,
  multisigProgramId,
  program.provider
);

const curatorAuthority = anchor.web3.Keypair.generate();
const authority = (
  (program.provider as anchor.AnchorProvider).wallet as NodeWallet
).payer;
const metaplex = new Metaplex(program.provider.connection).use(
  keypairIdentity(authority)
);

const installVault = authority.publicKey;
const multisig = anchor.web3.Keypair.generate();
const author = anchor.web3.Keypair.generate();
const otherCreator = anchor.web3.Keypair.generate();
const installAuthority = anchor.web3.Keypair.generate();

// @ts-ignore
let multisigSigner: anchor.web3.PublicKey;
let privateXnft: anchor.web3.PublicKey;
let xnft: anchor.web3.PublicKey;
let masterMetadata: anchor.web3.PublicKey;
let masterToken: anchor.web3.PublicKey;
let install: anchor.web3.PublicKey;
let review: anchor.web3.PublicKey;
let authorInstallation: anchor.web3.PublicKey;
let access: anchor.web3.PublicKey;

describe("Account Creations", () => {
  before(async () => {
    await program.provider.connection.requestAirdrop(
      curatorAuthority.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );

    await wait(500);

    const [ms, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [multisig.publicKey.toBytes()],
      multisigProgramId
    );

    await multisigProgram.methods
      .createMultisig([curatorAuthority.publicKey], new anchor.BN(1), bump)
      .accounts({
        multisig: multisig.publicKey,
      })
      .preInstructions([
        await multisigProgram.account.multisig.createInstruction(
          multisig,
          8 + (4 + 32) + 8 + 1 + 4
        ),
      ])
      .signers([multisig])
      .rpc();

    multisigSigner = ms;
  });

  describe("an xNFT can be created", () => {
    const installPrice = new anchor.BN(0);
    const name = "test xnft";
    const symbol = "";
    const tag = { defi: {} } as never;
    const kind = { collection: {} } as never;
    const uri = "https://arweave.net/abc123";
    const sellerFeeBasisPoints = 0;
    const supply = new anchor.BN(100);
    const l1 = { solana: {} } as never;
    const collection = anchor.web3.Keypair.generate().publicKey;

    let xnftData: anchor.IdlAccounts<Xnft>["xnft"];
    let meta: MetadataAccount;

    it("unless the name is too long", async () => {
      const badName = "this title is way too long use!";

      const [mint] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("mint"),
          authority.publicKey.toBytes(),
          Buffer.from(badName),
        ],
        program.programId
      );

      const masterToken = await getAssociatedTokenAddress(
        mint,
        authority.publicKey
      );

      try {
        await program.methods
          .createXnft(badName, null, {
            symbol,
            tag,
            kind,
            uri,
            sellerFeeBasisPoints,
            installAuthority: null,
            installPrice,
            installVault,
            supply,
            l1,
            collection: null,
            creators: [{ address: authority.publicKey, share: 100 }],
          })
          .accounts({ masterToken, metadataProgram })
          .rpc();

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "NameTooLong");
      }
    });

    it("when the arguments are within the bounds", async () => {
      const [mint] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("mint"), authority.publicKey.toBytes(), Buffer.from(name)],
        program.programId
      );

      masterToken = await getAssociatedTokenAddress(mint, authority.publicKey);

      const ix = program.methods
        .createXnft(name, null, {
          symbol,
          tag,
          kind,
          uri,
          sellerFeeBasisPoints,
          installAuthority: null,
          installPrice,
          installVault,
          supply,
          l1,
          collection,
          creators: [
            { address: authority.publicKey, share: 50 },
            { address: otherCreator.publicKey, share: 50 },
          ],
        })
        .accounts({
          payer: authority.publicKey,
          publisher: authority.publicKey,
          masterToken,
          metadataProgram,
        });

      const pubkeys = await ix.pubkeys();
      await ix.rpc();

      const accs = await program.account.xnft.all();
      assert.lengthOf(accs, 1);

      xnft = pubkeys.xnft;
      xnftData = accs[0].account as any;
      masterMetadata = pubkeys.masterMetadata;

      const acc = (await metaplex
        .rpc()
        .getAccount(masterMetadata)) as UnparsedAccount;
      meta = parseMetadataAccount(acc);
    });

    it("and the curator is not null when provided on creation", () => {
      assert.isNull(xnftData.curator);
    });

    it("and the creators are set in the metadata", () => {
      assert.lengthOf(meta.data.data.creators, 2);
      assert.strictEqual(
        meta.data.data.creators[0].address.toBase58(),
        authority.publicKey.toBase58()
      );
      assert.isTrue(meta.data.data.creators[0].verified);
      assert.strictEqual(
        meta.data.data.creators[1].address.toBase58(),
        otherCreator.publicKey.toBase58()
      );
      assert.isFalse(meta.data.data.creators[1].verified);
    });

    it("and the publisher is verified", () => {
      assert.strictEqual(
        meta.data.data.creators[0].address.toBase58(),
        authority.publicKey.toBase58()
      );
      assert.isTrue(meta.data.data.creators[0].verified);
    });

    it("and the collection public key can be attached but not verified", () => {
      assert.strictEqual(
        meta.data.collection.key.toBase58(),
        collection.toBase58()
      );
      assert.isFalse(meta.data.collection.verified);
    });

    it("and the metadata is marked with the primary sale already happened", () => {
      assert.isTrue(meta.data.primarySaleHappened);
    });

    it("and the token account is not frozen after the mint", async () => {
      const acc = await getAccount(program.provider.connection, masterToken);
      assert.isTrue(!acc.isFrozen);
    });
  });

  describe("a curator can be set on an xNFT", () => {
    it("when the user provides a valid curator account", async () => {
      await program.methods
        .setCurator()
        .accounts({
          xnft,
          masterToken,
          curator: multisigSigner,
        })
        .rpc();
    });

    it("and the curator account is set but unverified", async () => {
      const data = await program.account.xnft.fetch(xnft);
      assert.strictEqual(
        data.curator.pubkey.toBase58(),
        multisigSigner.toBase58()
      );
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
            curator: multisigSigner,
          })
          .rpc();
        assert.ok(false);
      } catch (_err) {}
    });

    it("if the curator authority signs the transaction", async () => {
      const ix = await program.methods
        .verifyCurator()
        .accounts({
          xnft,
          curator: multisigSigner,
        })
        .instruction();

      const transaction = anchor.web3.Keypair.generate();

      const initTransactionAccountIx =
        await multisigProgram.account.transaction.createInstruction(
          transaction,
          8 +
            32 +
            32 +
            (4 + (32 + 1 + 1) * ix.keys.length) +
            (4 + ix.data.length) +
            (4 + 1) +
            1 +
            4
        );

      const createTransactionIx = await multisigProgram.methods
        .createTransaction(ix.programId, ix.keys, ix.data)
        .accounts({
          multisig: multisig.publicKey,
          transaction: transaction.publicKey,
          proposer: curatorAuthority.publicKey,
        })
        .instruction();

      await multisigProgram.methods
        .executeTransaction()
        .accounts({
          multisig: multisig.publicKey,
          multisigSigner,
          transaction: transaction.publicKey,
        })
        .remainingAccounts(
          ix.keys
            .map((meta) =>
              meta.pubkey.equals(multisigSigner)
                ? { ...meta, isSigner: false }
                : meta
            )
            .concat({
              pubkey: program.programId,
              isSigner: false,
              isWritable: false,
            })
        )
        .preInstructions([initTransactionAccountIx, createTransactionIx])
        .signers([curatorAuthority, transaction])
        .rpc();
    });

    it("and the xNFT curator data will show verified", async () => {
      const acc = await program.account.xnft.fetch(xnft);
      assert.isTrue(acc.curator.verified);
    });
  });

  describe("an Install can be created", () => {
    it("unless the xNFT is suspended", async () => {
      await program.methods
        .setSuspended(true)
        .accounts({ xnft, masterToken })
        .rpc();

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
        await program.methods
          .setSuspended(false)
          .accounts({ xnft, masterToken })
          .rpc();
      }
    });

    it("when the xNFT is not currently suspended", async () => {
      const tx = program.methods.createInstall().accounts({
        xnft,
        installVault,
      });

      const pubkeys = await tx.pubkeys();
      await tx.rpc();

      const accs = await program.account.install.all();
      assert.lengthOf(accs, 1);

      install = pubkeys.install;
    });

    it("and the total installs for the xNFT will be incremented", async () => {
      const acc = await program.account.xnft.fetch(xnft);
      assert.strictEqual(acc.totalInstalls.toNumber(), 1);
    });
  });

  describe("a Review can be created", () => {
    before(async () => {
      await program.provider.connection.requestAirdrop(
        author.publicKey,
        anchor.web3.LAMPORTS_PER_SOL
      );

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
        await program.methods
          .createReview("https://google.com", 4)
          .accounts({ install, xnft, masterToken })
          .rpc();

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

  describe("a private xNFT can be created", () => {
    let xnftData: anchor.IdlAccounts<Xnft>["xnft"];

    before(async () => {
      await program.provider.connection.requestAirdrop(
        installAuthority.publicKey,
        1 * anchor.web3.LAMPORTS_PER_SOL
      );
    });

    it("when an install authority is provided to the instruction params", async () => {
      const name = "private xnft";
      const [mint] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("mint"), authority.publicKey.toBytes(), Buffer.from(name)],
        program.programId
      );

      const privateMasterToken = await getAssociatedTokenAddress(
        mint,
        authority.publicKey
      );

      const tx = program.methods
        .createXnft(name, null, {
          collection: null,
          creators: [{ address: authority.publicKey, share: 100 }],
          installAuthority: installAuthority.publicKey,
          installPrice: new anchor.BN(0),
          installVault: authority.publicKey,
          kind: { app: {} } as never,
          l1: { solana: {} } as never,
          sellerFeeBasisPoints: 0,
          supply: null,
          symbol: "",
          tag: { none: {} } as never,
          uri: "my_uri",
        })
        .accounts({
          masterToken: privateMasterToken,
          metadataProgram,
        });

      const keys = await tx.pubkeys();
      privateXnft = keys.xnft;

      await tx.rpc();

      xnftData = (await program.account.xnft.fetch(privateXnft)) as any;
    });

    it("and it is created with a set install authority", () => {
      assert.strictEqual(
        xnftData.installAuthority.toBase58(),
        installAuthority.publicKey.toBase58()
      );
    });

    describe("an Access grant can be created", () => {
      it("by the install authority of a private xNFT", async () => {
        await program.methods
          .grantAccess()
          .accounts({
            xnft: privateXnft,
            wallet: author.publicKey,
            authority: installAuthority.publicKey,
          })
          .signers([installAuthority])
          .rpc();
      });

      it("and then the wallet can install it", async () => {
        const tx = program.methods
          .createPermissionedInstall()
          .accounts({
            xnft: privateXnft,
            installVault: xnftData.installVault,
            authority: author.publicKey,
          })
          .signers([author]);

        const keys = await tx.pubkeys();
        access = keys.access;

        await tx.rpc();
      });
    });
  });
});

describe("Account Updates", () => {
  it("the data in an xNFT account can be updated by the owner", async () => {
    /*const ix =*/ await program.methods
      .updateXnft({
        installVault: null,
        price: new anchor.BN(100),
        tag: { none: {} } as never,
        uri: null,
      })
      .accounts({
        xnft,
        masterMetadata,
        masterToken,
        xnftAuthority: authority.publicKey,
        updateAuthority: multisigSigner,
        metadataProgram,
      })
      .rpc();
    // .instruction();

    // const transaction = anchor.web3.Keypair.generate();

    // const initTransactionAccountIx =
    //   await multisigProgram.account.transaction.createInstruction(
    //     transaction,
    //     8 +
    //       32 +
    //       32 +
    //       (4 + (32 + 1 + 1) * ix.keys.length) +
    //       (4 + ix.data.length) +
    //       (4 + 1) +
    //       1 +
    //       4
    //   );

    // await multisigProgram.methods
    //   .createTransaction(ix.programId, ix.keys, ix.data)
    //   .accounts({
    //     multisig: multisig.publicKey,
    //     transaction: transaction.publicKey,
    //     proposer: curatorAuthority.publicKey,
    //   })
    //   .preInstructions([initTransactionAccountIx])
    //   .signers([transaction, curatorAuthority])
    //   .rpc();

    // await multisigProgram.methods
    //   .executeTransaction()
    //   .accounts({
    //     multisig: multisig.publicKey,
    //     multisigSigner,
    //     transaction: transaction.publicKey,
    //   })
    //   .remainingAccounts(
    //     ix.keys
    //       .map((meta) =>
    //         meta.pubkey.equals(multisigSigner)
    //           ? { ...meta, isSigner: false }
    //           : meta
    //       )
    //       .concat({
    //         pubkey: program.programId,
    //         isSigner: false,
    //         isWritable: false,
    //       })
    //   )
    //   .rpc();

    const acc = await program.account.xnft.fetch(xnft);

    assert.strictEqual(acc.installPrice.toNumber(), 100);
    assert.deepEqual(acc.tag, { none: {} });
  });
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

  describe("Access can be revoked by the install authority", () => {
    it("using the revoke_access instruction", async () => {
      await program.methods
        .revokeAccess()
        .accounts({
          xnft: privateXnft,
          wallet: author.publicKey,
          authority: installAuthority.publicKey,
        })
        .signers([installAuthority])
        .rpc();
    });

    it("and the Access account will be closed", async () => {
      const acc = await program.account.access.fetchNullable(access);
      assert.isNull(acc);
    });
  });
});
