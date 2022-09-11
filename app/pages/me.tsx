import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback } from 'react';
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { forceOwnedRefresh } from '../state/atoms/xnft';
import Layout from '../components/Layout';
import { useXnftFocus, xnftEditsState } from '../state/atoms/edit';

const DisconnectedPlaceholder = dynamic(() => import('../components/Placeholders/Disconnected'));
const DownloadedApps = dynamic(() => import('../components/Profile/Downloaded'));
const EditModal = dynamic(() => import('../components/Modal/EditModal'));
const PublishedApps = dynamic(() => import('../components/Profile/Published'));

const MePage: NextPage = () => {
  const { connected } = useWallet();
  const [focused, setFocused] = useXnftFocus();
  const resetEdits = useResetRecoilState(xnftEditsState);
  const refreshOwned = useSetRecoilState(forceOwnedRefresh);

  /**
   * Memoized function to close the modal when the user clicks.
   */
  const handleModalClose = useCallback(
    (refresh?: boolean) => {
      setFocused(undefined);
      resetEdits();

      if (refresh) {
        refreshOwned(prev => prev + 1);
      }
    },
    [resetEdits, setFocused, refreshOwned]
  );

  return connected ? (
    <>
      <Layout>
        <section className="flex flex-col gap-20">
          <div className="pt-6 text-center text-white">
            <h1 className="text-6xl font-extrabold tracking-wide">My xNFTs</h1>
          </div>

          {/* Installed xNFTs Apps */}
          <DownloadedApps />

          {/* Published xNFTs Apps */}
          <PublishedApps />
        </section>
      </Layout>
      <EditModal open={focused !== undefined} onClose={handleModalClose} />
    </>
  ) : (
    <DisconnectedPlaceholder />
  );
};

export default MePage;
