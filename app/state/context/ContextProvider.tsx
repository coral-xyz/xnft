import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { type FunctionComponent, type ReactNode, useMemo } from 'react';
import { AutoConnectProvider, useAutoConnect } from './AutoConnectProvider';

const WalletContextProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const { autoConnect } = useAutoConnect();

  let network: WalletAdapterNetwork = null;
  if (process.env.NETWORK_ENV === 'devnet') network = WalletAdapterNetwork.Devnet;
  if (process.env.NETWORK_ENV === 'testnet') network = WalletAdapterNetwork.Testnet;
  if (process.env.NETWORK_ENV === 'mainnet') network = WalletAdapterNetwork.Mainnet;

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(() => [new BackpackWalletAdapter()], []);

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
