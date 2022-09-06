import { PencilIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FunctionComponent, memo, useMemo } from 'react';
import { SyncLoader } from 'react-spinners';
import { useOwnedXnftsLoadable } from '../../state/atoms/xnft';

const App = dynamic(() => import('../App'));
const ProfileAppListPlaceholder = dynamic(() => import('../Placeholders/ProfileAppList'));

const PublishedApps: FunctionComponent = () => {
  const { owned, loading } = useOwnedXnftsLoadable();

  /**
   * Memoized array of React nodes for the app list items.
   */
  const items = useMemo(
    () =>
      owned.map(item => (
        <li key={item.publicKey.toBase58()}>
          <App profile type="owned" xnft={item} />
        </li>
      )),
    [owned]
  );

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
            className="grid grid-cols-1 gap-y-4 gap-x-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {items}
          </ul>
        </div>
      )}
    </section>
  );
};

export default memo(PublishedApps);
