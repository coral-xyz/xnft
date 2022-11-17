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
      "GV6XT7kGRkq4CgGZodjtcyakSEUuvx29uJjLRWtnbKz2"
    );
  });

  test("master mint accounts", async () => {
    const pk = await deriveMasterMintAddress(
      "Sample xNFT",
      new PublicKey("FSHi6odnoRvHDvMpHXXLNBwrBgJFvFH5zBqDbHpwepnd")
    );
    expect(pk.toBase58()).toStrictEqual(
      "9kV7nkH2pJe6UFzaidn8MM6z4Q1eJsG8e86L8Y5P1Tb"
    );

    const pk2 = await deriveMasterMintAddress(
      "Sample xNFT",
      new PublicKey("FSHi6odnoRvHDvMpHXXLNBwrBgJFvFH5zBqDbHpwepnd"),
      new PublicKey("3f1Ypov9Lv1Lmr4arkjY2fTMHcj4dRWP7BcpiDW6PTe3")
    );
    expect(pk2.toBase58()).toStrictEqual(
      "F9iDvSqm9vJ6eysfz9EVUybh8v6SEyacaSFX5xWVKk1J"
    );
  });

  test("xnft accounts", async () => {
    const pk = await deriveXnftAddress(
      new PublicKey("3xoP7A2fQAiwYzeDNw9wrVQxBZQqsBDnGYWcp7Bv415P")
    );
    expect(pk.toBase58()).toStrictEqual(
      "BEu8zcBFcSgj48rgwzXyPEmuKq9sBXhARSLtAeFiUc3g"
    );
  });
});
