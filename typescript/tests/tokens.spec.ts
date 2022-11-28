import { describe, expect, test } from "@jest/globals";
import { Connection, PublicKey } from "@solana/web3.js";
import { getNftTokenAccountForMint } from "../src/tokens";

describe("Token accounts for NFTs should be fetchable", () => {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  test("by the individual mint address", async () => {
    const mint = new PublicKey("Ch97D4SLr2xKNoZ1t8DDEVHLBHEHanTZyCRgcbkNcNCP");
    const token = await getNftTokenAccountForMint(connection, mint);
    expect(token).toBeDefined();
    expect(token.account.mint.toBase58()).toStrictEqual(mint.toBase58());
    expect(token.account.amount.toString()).toStrictEqual("1");
  });
});
