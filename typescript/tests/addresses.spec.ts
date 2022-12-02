import { describe, expect, test } from "@jest/globals";
import { PublicKey } from "@solana/web3.js";
import {
  deriveAccessAddress,
  deriveInstallAddress,
  deriveMasterMintAddress,
  deriveReviewAddress,
  deriveXnftAddress,
} from "../src/addresses";

describe("Program account public keys should be derivable for", () => {
  test("access accounts", async () => {
    const [pk] = await deriveAccessAddress(
      new PublicKey("FSHi6odnoRvHDvMpHXXLNBwrBgJFvFH5zBqDbHpwepnd"),
      new PublicKey("BZ6YRowFVJ69gQRF5nbP4F4uUxukCKS2Lvez5pP6eA75")
    );
    expect(pk.toBase58()).toStrictEqual("4QLCQhcitQB29PHfLyNVbMUK1kqNeBkP7Rjauks9VYBh");
  });

  test("install accounts", async () => {
    const [pk] = await deriveInstallAddress(
      new PublicKey("FSHi6odnoRvHDvMpHXXLNBwrBgJFvFH5zBqDbHpwepnd"),
      new PublicKey("BZ6YRowFVJ69gQRF5nbP4F4uUxukCKS2Lvez5pP6eA75")
    );
    expect(pk.toBase58()).toStrictEqual("GV6XT7kGRkq4CgGZodjtcyakSEUuvx29uJjLRWtnbKz2");
  });

  test("master mint accounts", async () => {
    const [pk] = await deriveMasterMintAddress(
      "Sample xNFT",
      new PublicKey("FSHi6odnoRvHDvMpHXXLNBwrBgJFvFH5zBqDbHpwepnd")
    );
    expect(pk.toBase58()).toStrictEqual("6D3F4cbYj7RK3s6JiLMwBdozz7Jfna8zNKFjdjEqGDd9");
  });

  test("review accounts", async () => {
    const [pk] = await deriveReviewAddress(
      new PublicKey("BZ6YRowFVJ69gQRF5nbP4F4uUxukCKS2Lvez5pP6eA75"),
      new PublicKey("FSHi6odnoRvHDvMpHXXLNBwrBgJFvFH5zBqDbHpwepnd")
    );
    expect(pk.toBase58()).toStrictEqual("6HevA8GhrtYyAndJwzWukisQ2N9BKtAAhJvtsSBRnTwF");
  });

  test("xnft accounts", async () => {
    const [pk] = await deriveXnftAddress(new PublicKey("3xoP7A2fQAiwYzeDNw9wrVQxBZQqsBDnGYWcp7Bv415P"));
    expect(pk.toBase58()).toStrictEqual("BEu8zcBFcSgj48rgwzXyPEmuKq9sBXhARSLtAeFiUc3g");
  });
});
