import { Connection, PublicKey } from "@solana/web3.js";
import type { Access, Install, Review, xNFT } from "./types";
import { buildAnonymousProgram } from "./util";

export async function getAccessAccount(
  connection: Connection,
  publicKey: PublicKey
): Promise<Access> {
  return await buildAnonymousProgram(connection).account.access.fetch(
    publicKey
  );
}

export async function getInstallAccount(
  connection: Connection,
  publicKey: PublicKey
): Promise<Install> {
  return buildAnonymousProgram(connection).account.install.fetch(publicKey);
}

export async function getReviewAccount(
  connection: Connection,
  publicKey: PublicKey
): Promise<Review> {
  return await buildAnonymousProgram(connection).account.review.fetch(
    publicKey
  );
}

export async function getXnftAccount(
  connection: Connection,
  publicKey: PublicKey
): Promise<xNFT> {
  return (await buildAnonymousProgram(connection).account.review.fetch(
    publicKey
  )) as any;
}
