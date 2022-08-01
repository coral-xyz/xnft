import { Program } from '@project-serum/anchor';
import { useRecoilValue } from 'recoil';
import type { Xnft } from '../../programs/xnft';
import { program } from '../atoms/solana';

export function useProgram(): Program<Xnft> {
  return useRecoilValue(program);
}
