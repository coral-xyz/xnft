import * as anchor from "@coral-xyz/anchor";
import { assert } from "chai";
import type { Xnft } from "../target/types/xnft";
import { deriveAccessAddress, deriveXnftAddress, xNFT } from "../typescript/src";
import { client, wait } from "./common";

const installAuthority = anchor.web3.Keypair.generate();
const grantee = anchor.web3.Keypair.generate();

let access: anchor.web3.PublicKey;
let privateXnft: anchor.web3.PublicKey;
let privateXnftData: anchor.IdlAccounts<Xnft>["xnft"];

describe("Private xNFTs", () => {
  const c = new xNFT(new anchor.AnchorProvider(client.provider.connection, new anchor.Wallet(installAuthority), {}));
  const g = new xNFT(new anchor.AnchorProvider(client.provider.connection, new anchor.Wallet(grantee), {}));

  describe("a private xNFT can be created", () => {
    before(async () => {
      await client.provider.connection.requestAirdrop(installAuthority.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
      await wait(500);
    });

    it("when an install authority is provided to the create xNFT instruction", async () => {
      const name = "my private xnft";
      const [masterMint] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("mint"), client.provider.publicKey.toBytes(), Buffer.from(name)],
        client.program.programId
      );

      [privateXnft] = deriveXnftAddress(masterMint);

      await client.createAppXnft({
        creators: [{ address: client.provider.publicKey, share: 100 }],
        name,
        tag: "none",
        uri: "https://my.uri.com",
        installAuthority: installAuthority.publicKey,
      });

      privateXnftData = (await client.program.account.xnft.fetch(privateXnft)) as any;
    });

    it("and it is created with a set install authority", () => {
      assert.strictEqual(privateXnftData.installAuthority.toBase58(), installAuthority.publicKey.toBase58());
    });
  });

  describe("an Access grant can be created", () => {
    before(async () => {
      await client.provider.connection.requestAirdrop(grantee.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
      await wait(500);
    });

    it("by the install authority of a private xNFT", async () => {
      await c.grantAccess(privateXnft, grantee.publicKey);
    });

    it("and then the wallet can install it", async () => {
      [access] = deriveAccessAddress(grantee.publicKey, privateXnft);
      await g.install(privateXnft, privateXnftData.installVault, true);
    });
  });

  describe("access can be revoked by the install authority", () => {
    before(async () => {
      await c.grantAccess(privateXnft, grantee.publicKey);
    });

    it("using the revoke_access instruction", async () => {
      await c.revokeAccess(privateXnft, grantee.publicKey);
    });

    it("and the Access account will be closed", async () => {
      const acc = await client.program.account.access.fetchNullable(access);
      assert.isNull(acc);
    });
  });
});
