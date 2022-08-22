import { useLocalStorage } from '@solana/wallet-adapter-react';
import { createContext, useContext, type FunctionComponent, type ReactNode } from 'react';

export interface AutoConnectContextState {
  autoConnect: boolean;
  setAutoConnect(autoConnect: boolean): void;
}

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

export function useAutoConnect(): AutoConnectContextState {
  return useContext(AutoConnectContext);
}
