import { Squares2X2Icon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { type FunctionComponent, memo, useMemo } from 'react';
import { SyncLoader } from 'react-spinners';
import { useInstalledXnftsLoadable } from '../../state/atoms/xnft';

const App = dynamic(() => import('../App'));
const ProfileAppListPlaceholder = dynamic(() => import('../Placeholders/ProfileAppList'));

const DownloadedApps: FunctionComponent = () => {
  const { installed, loading } = useInstalledXnftsLoadable();

  /**
   * Memoized list of React nodes for app list items.
   */
  const items = useMemo(
    () =>
      installed.map(item => (
        <li key={item.xnft.publicKey.toBase58()}>
          <App profile type="installed" xnft={item} />
        </li>
      )),
    [installed]
  );

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-3xl font-extrabold tracking-wide text-white">Downloaded</h2>
      {loading ? (
        <SyncLoader className="my-12 self-center" color="#0D9488" size={20} />
      ) : installed.length === 0 ? (
        <ProfileAppListPlaceholder
          buttonHref="/"
          buttonText="Browse the Library"
          buttonIcon={<Squares2X2Icon className="h-6 w-6" />}
          subtitle="Find xNFTs in the decentralized library."
        />
      ) : (
        <div className="flex w-full flex-col justify-center">
          <ul
            role="list"
            className="grid grid-cols-1 gap-y-4 gap-x-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {items}
          </ul>
        </div>
      )}
    </div>
  );
};

export default memo(DownloadedApps);
