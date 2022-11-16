import { describe, expect, test } from "@jest/globals";
import { PublicKey } from "@solana/web3.js";
import {
  deriveInstallAddress,
  deriveMasterMintAddress,
  deriveXnftAddress,
} from "../src/addresses";

describe("Program account public keys should be derivable for", () => {
  test("install accounts", async () => {
    const pk = await deriveInstallAddress(
      new PublicKey("FSHi6odnoRvHDvMpHXXLNBwrBgJFvFH5zBqDbHpwepnd"),
      new PublicKey("BZ6YRowFVJ69gQRF5nbP4F4uUxukCKS2Lvez5pP6eA75")
    );
    expect(pk.toBase58()).toStrictEqual(
      "D7VQcUZpWn8DynLNoRWT3ogT8ppUm61hbVcpwhQQNcEe"
    );
  });

  test("master mint accounts", async () => {
    const pk = await deriveMasterMintAddress(
      "Sample xNFT",
      new PublicKey("FSHi6odnoRvHDvMpHXXLNBwrBgJFvFH5zBqDbHpwepnd")
    );
    expect(pk.toBase58()).toStrictEqual(
      "3xoP7A2fQAiwYzeDNw9wrVQxBZQqsBDnGYWcp7Bv415P"
    );
  });

  test("xnft accounts", async () => {
    const pk = await deriveXnftAddress(
      new PublicKey("3xoP7A2fQAiwYzeDNw9wrVQxBZQqsBDnGYWcp7Bv415P")
    );
    expect(pk.toBase58()).toStrictEqual(
      "6zMGSegJQC6AG7ndspUoyDHoGQPTkwZf8q3yvEFA2vjf"
    );
  });
});
