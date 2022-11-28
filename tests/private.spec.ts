import * as anchor from "@project-serum/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { assert } from "chai";
import type { Xnft } from "../target/types/xnft";
import { metadataProgram, program, wait } from "./common";

const installAuthority = anchor.web3.Keypair.generate();
const grantee = anchor.web3.Keypair.generate();

let access: anchor.web3.PublicKey;
let privateXnft: anchor.web3.PublicKey;
let privateXnftData: anchor.IdlAccounts<Xnft>["xnft"];

describe("Private xNFTs", () => {
  describe("a private xNFT can be created", () => {
    before(async () => {
      await program.provider.connection.requestAirdrop(installAuthority.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
      await wait(500);
    });

    it("when an install authority is provided to the create xNFT instruction", async () => {
      const name = "my private xnft";
      const [masterMint] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("mint"), program.provider.publicKey.toBytes(), Buffer.from(name)],
        program.programId
      );

      const masterToken = await getAssociatedTokenAddress(masterMint, program.provider.publicKey);

      const method = program.methods
        .createXnft(name, {
          creators: [{ address: program.provider.publicKey, share: 100 }],
          curator: null,
          installAuthority: installAuthority.publicKey,
          installPrice: new anchor.BN(0),
          installVault: program.provider.publicKey,
          sellerFeeBasisPoints: 0,
          supply: null,
          symbol: "",
          tag: { none: {} } as never,
          uri: "https://my.uri.com",
        })
        .accounts({
          masterMint,
          masterToken,
          metadataProgram,
        });

      privateXnft = (await method.pubkeys()).xnft;
      await method.rpc();

      privateXnftData = (await program.account.xnft.fetch(privateXnft)) as any;
    });

    it("and it is created with a set install authority", () => {
      assert.strictEqual(privateXnftData.installAuthority.toBase58(), installAuthority.publicKey.toBase58());
    });
  });

  describe("an Access grant can be created", () => {
    before(async () => {
      await program.provider.connection.requestAirdrop(grantee.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
      await wait(500);
    });

    it("by the install authority of a private xNFT", async () => {
      await program.methods
        .grantAccess()
        .accounts({
          xnft: privateXnft,
          wallet: grantee.publicKey,
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
          installVault: privateXnftData.installVault,
          authority: grantee.publicKey,
        })
        .signers([grantee]);

      const keys = await tx.pubkeys();
      access = keys.access;

      await tx.rpc();
    });
  });

  describe("access can be revoked by the install authority", () => {
    it("using the revoke_access instruction", async () => {
      await program.methods
        .revokeAccess()
        .accounts({
          xnft: privateXnft,
          wallet: grantee.publicKey,
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
