import * as anchor from "@coral-xyz/anchor";
import type { Xnft } from "../target/types/xnft";
import { xNFT } from "../typescript/src";

const program = anchor.workspace.Xnft as anchor.Program<Xnft>;
export const client = new xNFT(program.provider);

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const metadataProgram = new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
