import { type CreateNftOutput, Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import * as anchor from "@project-serum/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { assert } from "chai";
import { program, wait } from "./common";

const metaplex = new Metaplex(program.provider.connection).use(
  // @ts-ignore
  keypairIdentity(program.provider.wallet.payer)
);

describe("Digital collectible xNFTs", () => {
  let xnft: anchor.web3.PublicKey;
  let invalidNft: CreateNftOutput;
  let validNft: CreateNftOutput;

  before(async () => {
    await program.provider.connection.requestAirdrop(program.provider.publicKey, 5 * anchor.web3.LAMPORTS_PER_SOL);

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
        await program.methods
          .createAssociatedXnft({ nft: { pubkey: invalidNft.metadataAddress } } as never, {
            creators: [{ address: program.provider.publicKey, share: 100 }],
            curator: null,
            installAuthority: null,
            installPrice: new anchor.BN(0),
            installVault: program.provider.publicKey,
            sellerFeeBasisPoints: 0,
            supply: null,
            symbol: "",
            tag: { none: {} } as never,
            uri: "https://arweave.net/abc123",
          })
          .accounts({
            masterMint: invalidNft.mintAddress,
            masterToken: invalidNft.tokenAddress,
            masterMetadata: invalidNft.metadataAddress,
          })
          .rpc();

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "MetadataIsImmutable");
      }
    });

    it("when there is an existing valid NFT or Collection to link it to", async () => {
      const method = program.methods
        .createAssociatedXnft({ nft: {} } as never, {
          creators: [{ address: program.provider.publicKey, share: 100 }],
          curator: null,
          installAuthority: null,
          installPrice: new anchor.BN(0),
          installVault: program.provider.publicKey,
          sellerFeeBasisPoints: 0,
          supply: null,
          symbol: "",
          tag: { none: {} } as never,
          uri: "https://arweave.net/abc123",
        })
        .accounts({
          masterMint: validNft.mintAddress,
          masterToken: validNft.tokenAddress,
          masterMetadata: validNft.metadataAddress,
        });

      xnft = (await method.pubkeys()).xnft;
      await method.rpc();
    });

    it("and the NFT pubkeys on the xNFT account match the collectible", async () => {
      const acc = await program.account.xnft.fetch(xnft);
      assert.strictEqual(acc.masterMetadata.toBase58(), validNft.metadataAddress.toBase58());
      assert.strictEqual(acc.masterMint.toBase58(), validNft.mintAddress.toBase58());
    });

    it("and installation cannot be created against a collectibles xNFT", async () => {
      try {
        await program.methods
          .createInstall()
          .accounts({
            xnft,
            installVault: program.provider.publicKey,
          })
          .rpc();

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "MustBeApp");
      }
    });

    it("and a collectible xNFT cannot be suspended", async () => {
      try {
        await program.methods
          .setSuspended(true)
          .accounts({
            masterToken: validNft.tokenAddress,
            xnft,
          })
          .rpc();

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "MustBeApp");
      }
    });

    it("and a collectible xNFT cannot be transferred through the protocol", async () => {
      const recipient = anchor.web3.Keypair.generate().publicKey;
      const destination = await getAssociatedTokenAddress(validNft.mintAddress, recipient);

      try {
        await program.methods
          .transfer()
          .accounts({
            destination,
            masterMint: validNft.mintAddress,
            recipient,
            source: validNft.tokenAddress,
            xnft,
          })
          .rpc();

        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorCode.code, "MustBeApp");
      }
    });
  });
});
