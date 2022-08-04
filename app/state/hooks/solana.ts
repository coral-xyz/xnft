import { useContext } from 'react';
import { AutoConnectContext, type AutoConnectContextState } from '../context/AutoConnectProvider';
import { ProgramContext, type ProgramContextState } from '../context/program';

export function useAutoConnect(): AutoConnectContextState {
  return useContext(AutoConnectContext);
}

export function useProgram(): ProgramContextState {
  return useContext(ProgramContext);
}
