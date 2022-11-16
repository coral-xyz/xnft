import { describe, expect, test } from "@jest/globals";
import { Connection, PublicKey } from "@solana/web3.js";
import { getXnftAccount } from "../src/accounts";

describe("On-chain should be able to be pulled for", () => {
  const conn = new Connection(
    "https://api.mainnet-beta.solana.com",
    "confirmed"
  );

  test("xnft program accounts", async () => {
    const acc = await getXnftAccount(
      conn,
      new PublicKey("BZ6YRowFVJ69gQRF5nbP4F4uUxukCKS2Lvez5pP6eA75")
    );

    expect(acc).toBeDefined();
    expect(acc.name).toStrictEqual("TIEXO");
  });
});
