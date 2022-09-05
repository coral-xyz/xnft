import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-wallets';
import PlausibleProvider from 'next-plausible';
import { type FunctionComponent, type ReactNode, useMemo } from 'react';
import { RecoilRoot } from 'recoil';
import { useConnection } from '../atoms/solana';

const WalletContextProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const [connection] = useConnection();

  const wallets = useMemo(() => [new BackpackWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={connection.rpcEndpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const ContextProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  return (
    <RecoilRoot>
      <PlausibleProvider domain="xnft.gg" trackOutboundLinks={true}>
        <WalletContextProvider>{children}</WalletContextProvider>
      </PlausibleProvider>
    </RecoilRoot>
  );
};
