import { atom, type SetterOrUpdater, useRecoilState } from 'recoil';
import type { XnftWithMetadata } from '../../utils/xnft';

export const editModalState = atom<XnftWithMetadata>({
  key: 'editModal',
  default: undefined
});

export function useEditModal(): [XnftWithMetadata, SetterOrUpdater<XnftWithMetadata>] {
  return useRecoilState(editModalState);
}
