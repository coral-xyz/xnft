import BN from 'bn.js';
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Xnft } from "../target/types/xnft";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

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
    const uri = "https://test.com";
    const seller_fee_basis_points = 1;
    const tx = await program
      .methods
      .createXnft(
        name,
        symbol,
        uri,
        seller_fee_basis_points,
        installPrice,
        installVault,
      )
      .accounts({
        metadataProgram,
      });
    await tx.rpc();

    const pubkeys = await tx.pubkeys();
    xnft = pubkeys.xnft;
  });

  it("installs an xNFT into the user's wallet", async () => {
    const tx = await program
      .methods
      .createInstall()
      .accounts({
        xnft,
        installVault,
      });
    await tx.rpc();

    const pubkeys = await tx.pubkeys();
    install = pubkeys.install;
  });

  it("checks the accounts were created correctly", async () => {
    const xnftAccount = await program.account.xnft.fetch(xnft);
    const installAccount = await program.account.install.fetch(install);
    const metadataAccount = await Metadata.fromAccountAddress(
      program.provider.connection,
      installAccount.masterMetadata,
    );
    console.log('xnft', xnftAccount);
    console.log('install', installAccount);
    console.log('metadata', metadataAccount);
  });
});
