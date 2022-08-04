import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { BackpackWalletAdapter, PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { type FunctionComponent, type ReactNode, useMemo } from 'react';
import { useAutoConnect } from '../hooks/solana';
import { AutoConnectProvider } from './AutoConnectProvider';
import { ProgramProvider } from './program';

const WalletContextProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const { autoConnect } = useAutoConnect();

  let network: WalletAdapterNetwork = undefined;
  if (process.env.NETWORK_ENV === 'devnet') network = WalletAdapterNetwork.Devnet;
  if (process.env.NETWORK_ENV === 'testnet') network = WalletAdapterNetwork.Testnet;
  if (process.env.NETWORK_ENV === 'mainnet') network = WalletAdapterNetwork.Mainnet;

  const endpoint = useMemo(
    () => (network ? clusterApiUrl(network) : 'http://127.0.0.1:8899'),
    [network]
  );

  const wallets = useMemo(() => [new BackpackWalletAdapter(), new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={autoConnect}>
        <WalletModalProvider>
          <ProgramProvider>{children}</ProgramProvider>
        </WalletModalProvider>
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
