// Copyright (C) 2022 Blue Coral, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

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
const mockCollection = anchor.web3.Keypair.generate().publicKey;

let multisigSigner: anchor.web3.PublicKey;
let privateXnft: anchor.web3.PublicKey;
let xnft: anchor.web3.PublicKey;
let masterMetadata: anchor.web3.PublicKey;
let masterMint: anchor.web3.PublicKey;
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
    const kind = { app: {} } as never;
    const uri = "https://arweave.net/abc123";
    const sellerFeeBasisPoints = 0;
    const supply = null;

    let xnftData: anchor.IdlAccounts<Xnft>["xnft"];
    let meta: MetadataAccount;

    it("unless the name is too long", async () => {
      const badName = "this title is way too long use!";

      const [mint] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("mint"),
          program.programId.toBytes(),
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
          .createXnft(badName, {
            symbol,
            tag,
            kind,
            uri,
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
        assert.strictEqual(e.error.errorCode.code, "NameTooLong");
      }
    });

    it("when the arguments are within the bounds", async () => {
      const [mint] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("mint"),
          program.programId.toBytes(),
          authority.publicKey.toBytes(),
          Buffer.from(name),
        ],
        program.programId
      );

      masterMint = mint;
      masterToken = await getAssociatedTokenAddress(mint, authority.publicKey);

      const ix = program.methods
        .createXnft(name, {
          symbol,
          tag,
          kind,
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

    it("and the metadata is marked with the primary sale already happened", () => {
      assert.isTrue(meta.data.primarySaleHappened);
    });

    it("and the token account is frozen after the mint", async () => {
      const acc = await getAccount(program.provider.connection, masterToken);
      assert.isTrue(acc.isFrozen);
    });

    it("an xNFT can be created and associated with an external entity via the kind enum", async () => {
      const [mint] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("mint"),
          mockCollection.toBytes(),
          authority.publicKey.toBytes(),
          Buffer.from("Associated xNFT"),
        ],
        program.programId
      );

      const masterToken = await getAssociatedTokenAddress(
        mint,
        authority.publicKey
      );

      const ix = program.methods
        .createXnft("Associated xNFT", {
          creators: [{ address: authority.publicKey, share: 100 }],
          curator: null,
          installAuthority: null,
          installPrice: new anchor.BN(0),
          installVault: authority.publicKey,
          kind: { collection: { pubkey: mockCollection } } as never,
          sellerFeeBasisPoints: 0,
          supply: null,
          symbol: "",
          tag: { none: {} } as never,
          uri: "https://google.com",
        })
        .accounts({
          masterMint: mint,
          masterToken,
          metadataProgram,
        });

      const pk = await ix.pubkeys();
      await ix.rpc();

      const acc = await program.account.xnft.fetch(pk.xnft);
      assert.deepEqual(acc.kind, { collection: { pubkey: mockCollection } });

      const m = (await metaplex
        .rpc()
        .getAccount(pk.masterMetadata)) as UnparsedAccount;
      const meta = parseMetadataAccount(m);
      assert.deepEqual(meta.data.collection, {
        key: mockCollection,
        verified: false,
      });
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
        [
          Buffer.from("mint"),
          program.programId.toBytes(),
          authority.publicKey.toBytes(),
          Buffer.from(name),
        ],
        program.programId
      );

      const privateMasterToken = await getAssociatedTokenAddress(
        mint,
        authority.publicKey
      );

      const tx = program.methods
        .createXnft(name, {
          creators: [{ address: authority.publicKey, share: 100 }],
          curator: null,
          installAuthority: installAuthority.publicKey,
          installPrice: new anchor.BN(0),
          installVault: authority.publicKey,
          kind: { app: {} } as never,
          sellerFeeBasisPoints: 0,
          supply: null,
          symbol: "",
          tag: { none: {} } as never,
          uri: "my_uri",
        })
        .accounts({
          masterMint: mint,
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
  const newAuthority = anchor.web3.Keypair.generate();

  before(async () => {
    await program.provider.connection.requestAirdrop(
      newAuthority.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
  });

  it("the data in an xNFT account can be updated by the owner", async () => {
    /*const ix =*/ await program.methods
      .updateXnft({
        installAuthority: null,
        installPrice: new anchor.BN(100),
        installVault,
        supply: new anchor.BN(200),
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
    assert.strictEqual(acc.supply.toNumber(), 200);
    assert.deepEqual(acc.tag, { none: {} });
  });

  it("an xNFT can be transferred to another authority", async () => {
    const destination = await getAssociatedTokenAddress(
      masterMint,
      newAuthority.publicKey
    );

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

    const oldAta = await program.provider.connection.getAccountInfo(
      masterToken
    );
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
