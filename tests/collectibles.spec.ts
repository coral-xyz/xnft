import * as anchor from "@coral-xyz/anchor";
import { type CreateNftOutput, keypairIdentity, Metaplex } from "@metaplex-foundation/js";
import { assert } from "chai";
import { deriveXnftAddress } from "../typescript/src";
import { client, wait } from "./common";

// @ts-ignore
const metaplex = new Metaplex(client.provider.connection).use(keypairIdentity(client.provider.wallet.payer));

describe("Digital collectible xNFTs", () => {
  let xnft: anchor.web3.PublicKey;
  let invalidNft: CreateNftOutput;
  let validNft: CreateNftOutput;

  before(async () => {
    await client.provider.connection.requestAirdrop(client.provider.publicKey, 5 * anchor.web3.LAMPORTS_PER_SOL);

    await wait(500);

    invalidNft = await metaplex.nfts().create({
      name: "My Invalid Digital Collectible",
      sellerFeeBasisPoints: 0,
      uri: "https://arweave.net/my-invalid-content-hash",
      isMutable: false,
    });

    validNft = await metaplex.nfts().create({
      name: "My Digital Collectible",
      sellerFeeBasisPoints: 0,
      uri: "https://arweave.net/my-content-hash",
      isMutable: true,
    });
  });

  describe("an associated xNFT can be created", () => {
    it("unless the digital collectible metadata is immutable", async () => {
      try {
        await client.createCollectibleXnft({
          metadata: invalidNft.metadataAddress,
          mint: invalidNft.mintAddress,
          tag: "none",
          uri: "https://arweave.net/abc123",
        });

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "MetadataIsImmutable");
      }
    });

    it("when there is an existing valid NFT or Collection to link it to", async () => {
      [xnft] = deriveXnftAddress(validNft.mintAddress);

      await client.createCollectibleXnft({
        metadata: validNft.metadataAddress,
        mint: validNft.mintAddress,
        tag: "none",
        uri: "https://arweave.net/abc123",
      });
    });

    it("and the NFT pubkeys on the xNFT account match the collectible", async () => {
      const acc = await client.program.account.xnft.fetch(xnft);
      assert.strictEqual(acc.masterMetadata.toBase58(), validNft.metadataAddress.toBase58());
      assert.strictEqual(acc.masterMint.toBase58(), validNft.mintAddress.toBase58());
    });

    it("and installation cannot be created against a collectibles xNFT", async () => {
      try {
        await client.install(xnft, client.provider.publicKey);
        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "MustBeApp");
      }
    });

    it("and a collectible xNFT cannot be transferred through the protocol", async () => {
      const recipient = anchor.web3.Keypair.generate().publicKey;

      try {
        await client.transfer(xnft, validNft.mintAddress, recipient);
        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "MustBeApp");
      }
    });
  });
});
