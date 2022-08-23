import { PencilIcon, ViewGridAddIcon } from '@heroicons/react/outline';
import { type FunctionComponent, useCallback } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  forceOwnedRefresh,
  useInstalledXnftsLoadable,
  useOwnedXnftsLoadable
} from '../state/atoms/xnft';
import Layout from '../components/Layout';
import { useXnftFocus, xnftEditsState } from '../state/atoms/edit';
import { useWallet } from '@solana/wallet-adapter-react';
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { SyncLoader } from 'react-spinners';

const App = dynamic(() => import('../components/App'));
const DisconnectedPlaceholder = dynamic(() => import('../components/Placeholders/Disconnected'));
const EditModal = dynamic(() => import('../components/Modal/EditModal'));
const ProfileAppListPlaceholder = dynamic(
  () => import('../components/Placeholders/ProfileAppList')
);

const DownloadedApps: FunctionComponent = () => {
  const { installed, loading } = useInstalledXnftsLoadable();

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-3xl font-extrabold tracking-wide text-white">Downloaded</h2>
      {loading ? (
        <SyncLoader className="my-12 self-center" color="#0D9488" size={20} />
      ) : installed.length === 0 ? (
        <ProfileAppListPlaceholder
          buttonHref="/"
          buttonText="Browse the Library"
          buttonIcon={<ViewGridAddIcon className="h-6 w-6" />}
          subtitle="Find xNFTs in the decentralized library."
        />
      ) : (
        <div className="flex w-full flex-col justify-center">
          <ul
            role="list"
            className="grid grid-cols-2 gap-y-4 gap-x-4 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {installed.map(item => (
              <li key={item.xnft.publicKey.toBase58()}>
                <App
                  profile
                  type="installed"
                  price={item.xnft.account.installPrice.toNumber()}
                  xnft={item}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const PublishedApps: FunctionComponent = () => {
  const { owned, loading } = useOwnedXnftsLoadable();

  return (
    <section className="flex flex-col gap-8">
      <h2 className="flex items-center text-3xl font-extrabold tracking-wide text-white">
        <span className="flex-1">Published</span>
        {owned.length > 0 && (
          <Link
            href="/publish"
            className="flex items-center gap-2 rounded-md bg-[#0D9488] py-2 px-3 text-sm font-normal"
          >
            <PencilIcon height={12} />
            Publish New xNFT
          </Link>
        )}
      </h2>
      {loading ? (
        <SyncLoader className="my-12 self-center" color="#0D9488" size={20} />
      ) : owned.length === 0 ? (
        <ProfileAppListPlaceholder
          buttonHref="/publish"
          buttonText="Publish new xNFT"
          buttonIcon={<PencilIcon className="h-6 w-6" />}
          subtitle="Get started by publishing your app on the decentralized xNFT library."
        />
      ) : (
        <div className="flex w-full flex-col justify-center">
          <ul
            role="list"
            className="grid grid-cols-2 gap-y-4 gap-x-4 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {owned.map(item => (
              <li key={item.publicKey.toBase58()}>
                <App
                  profile
                  type="owned"
                  price={item.account.installPrice.toNumber()}
                  xnft={item}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

const MePage: NextPage = () => {
  const { connected } = useWallet();
  const [focused, setFocused] = useXnftFocus();
  const resetEdits = useResetRecoilState(xnftEditsState);
  const refreshOwned = useSetRecoilState(forceOwnedRefresh);

  /**
   * Memoized function to close the modal when the user clicks.
   */
  const handleModalClose = useCallback(() => {
    setFocused(undefined);
    resetEdits();
    refreshOwned(prev => prev + 1);
  }, [resetEdits, setFocused, refreshOwned]);

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
