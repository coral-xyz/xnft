import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-wallets';
import { type FunctionComponent, type ReactNode, useMemo } from 'react';
import { useAutoConnect } from '../context/AutoConnectProvider';
import { useConnection } from '../atoms/solana';
import { AutoConnectProvider } from './AutoConnectProvider';

const WalletContextProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const { autoConnect } = useAutoConnect();
  const [connection] = useConnection();

  const wallets = useMemo(() => [new BackpackWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={connection.rpcEndpoint}>
      <WalletProvider wallets={wallets} autoConnect={autoConnect}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const ContextProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  return (
    <AutoConnectProvider>
      <WalletContextProvider>{children}</WalletContextProvider>
    </AutoConnectProvider>
  );
};
