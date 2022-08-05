import { Program } from '@project-serum/anchor';
import { type SetterOrUpdater, useRecoilState, useRecoilValue } from 'recoil';
import type { Xnft } from '../../programs/xnft';
import { connectionUrl, programState } from '../atoms/solana';

export function useConnectionUrl(): [string, SetterOrUpdater<string>] {
  return useRecoilState(connectionUrl);
}

export function useProgram(): Program<Xnft> {
  return useRecoilValue(programState);
}
