import { useLocalStorage } from '@solana/wallet-adapter-react';
import { createContext, type FunctionComponent, type ReactNode } from 'react';

export type AutoConnectContextState = {
  autoConnect: boolean;
  setAutoConnect(autoConnect: boolean): void;
};

export const AutoConnectContext = createContext<AutoConnectContextState>(
  {} as AutoConnectContextState
);

export const AutoConnectProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const [autoConnect, setAutoConnect] = useLocalStorage('autoConnect', true);

  return (
    <AutoConnectContext.Provider value={{ autoConnect, setAutoConnect }}>
      {children}
    </AutoConnectContext.Provider>
  );
};
