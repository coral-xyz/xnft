import { AnchorProvider, Program } from '@project-serum/anchor';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { createContext, type FunctionComponent, type ReactNode, useState, useEffect } from 'react';
import { IDL, type Xnft } from '../../programs/xnft';
import { XNFT_PROGRAM_ID } from '../../utils/xnft';

export type ProgramContextState = {
  program: Program<Xnft>;
};

const defaultValue = new Program(
  IDL,
  XNFT_PROGRAM_ID,
  new AnchorProvider(
    undefined,
    { publicKey: PublicKey.default, signTransaction: undefined, signAllTransactions: undefined },
    {}
  )
);

export const ProgramContext = createContext<ProgramContextState>({} as ProgramContextState);

export const ProgramProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const { connected } = useWallet();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [program, setProgram] = useState(defaultValue);

  useEffect(() => {
    if (connected) {
      setProgram(new Program(IDL, XNFT_PROGRAM_ID, new AnchorProvider(connection, wallet, {})));
    } else {
      setProgram(defaultValue);
    }
  }, [connected, connection, wallet]);

  return <ProgramContext.Provider value={{ program }}>{children}</ProgramContext.Provider>;
};
