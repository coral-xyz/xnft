import { Program, AnchorProvider } from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import { PROGRAM_ID } from ".";
import { type Xnft, IDL } from "./xnft";

export function buildAnonymousProgram(connection: Connection): Program<Xnft> {
  const provider = new AnchorProvider(
    connection,
    // @ts-ignore
    { publicKey: PublicKey.default },
    {}
  );
  return new Program(IDL, PROGRAM_ID, provider);
}
