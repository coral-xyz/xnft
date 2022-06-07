import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Xnft } from "../target/types/xnft";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { assert } from "chai";

const metadataProgram = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

describe("xnft", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Xnft as Program<Xnft>;

  let xnft;
  let install;
  const installVault = program.provider.publicKey;

  it("creates the xNFT", async () => {
    const installPrice = new BN(0);
    const name = "my-xnft";
    const symbol = "xnft";
    const uri =
      "https://xnfts-dev.s3.us-west-2.amazonaws.com/DigDvhGGe29L6PWd3a42GJpDJV8WqSS2CTaeNzpH8QnK/Mango+Swap/metadata.json";
    const seller_fee_basis_points = 1;
    const tx = await program.methods
      .createXnft(name, symbol, uri, seller_fee_basis_points, installPrice, installVault)
      .accounts({
        metadataProgram,
      });
    await tx.rpc();

    const pubkeys = await tx.pubkeys();
    xnft = pubkeys.xnft;
  });

  it("fetch created xNFT", async () => {
    const fetchedXnft = await program.account.xnft.fetch(xnft)
    assert.equal(fetchedXnft.name, "my-xnft")
  })

  it("installs an xNFT into the user's wallet", async () => {
    const tx = await program.methods.createInstall().accounts({
      xnft,
      installVault,
    });
    await tx.rpc();

    const pubkeys = await tx.pubkeys();
    install = pubkeys.install;
  });

  it("fetch xnfts owned by user", async () => {
    const ownedxNFTs = await program.account.xnft.all([
      {
        memcmp: {
          offset: 8, // Discriminator
          bytes: program.provider.publicKey.toBase58()
        }
      }
    ])

    assert.isNotEmpty(ownedxNFTs)
  })


  it("fetch user installed xNFTs", async () => {
    const installedxNFTs = await program.account.install.all([
      {
        memcmp: {
          offset: 8, // Discriminator
          bytes: program.provider.publicKey.toBase58()
        }
      }
    ])

    assert.isNotEmpty(installedxNFTs)
  })
});
