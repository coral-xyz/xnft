import { PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Xnft } from "../target/types/xnft";

const metadataProgram = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

describe("xnft", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Xnft as Program<Xnft>;

  it("Is initialized!", async () => {
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
			)
			.accounts({
				metadataProgram,
			})
			.rpc();
    console.log("Your transaction signature", tx);
  });
});
