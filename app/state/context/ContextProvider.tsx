import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { BackpackWalletAdapter, PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { type FunctionComponent, type ReactNode, useMemo } from 'react';
import { useAutoConnect } from '../context/AutoConnectProvider';
import { useConnectionUrl } from '../atoms/solana';
import { AutoConnectProvider } from './AutoConnectProvider';

const WalletContextProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const { autoConnect } = useAutoConnect();
  const [endpoint] = useConnectionUrl();

  const wallets = useMemo(() => [new BackpackWalletAdapter(), new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
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
