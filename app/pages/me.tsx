import { PencilIcon, ViewGridAddIcon } from '@heroicons/react/outline';
import { useCallback, type FunctionComponent, type ReactNode } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useInstalledXnftsLoadable, useOwnedXnftsLoadable } from '../state/atoms/xnft';
import Layout from '../components/Layout';
import { useXnftFocus } from '../state/atoms/edit';
import { useWallet } from '@solana/wallet-adapter-react';

const App = dynamic(() => import('../components/App'));
const DisconnectedPlaceholder = dynamic(() => import('../components/Placeholders/Disconnected'));
const EditModal = dynamic(() => import('../components/Modal/EditModal'));

type PlaceholderProps = {
  buttonIcon: ReactNode;
  buttonHref: string;
  buttonText: string;
  subtitle: string;
};

const Placeholder: FunctionComponent<PlaceholderProps> = props => {
  return (
    <div
      className="flex h-48 w-full flex-col justify-center gap-1 rounded-xl
        border border-[#374151] text-center"
    >
      <span className="tracking-wide text-[#F9FAFB]">No xNFTs</span>
      <span className="tracking-wide text-[#9CA3AF]">{props.subtitle}</span>
      <Link
        href={props.buttonHref}
        className="mx-auto mt-5 flex gap-2 rounded-lg bg-[#0D9488]
          py-2 px-3 tracking-wide text-white"
      >
        {props.buttonIcon}
        <span className="font-medium">{props.buttonText}</span>
      </Link>
    </div>
  );
};

const MePage: NextPage = () => {
  const { connected } = useWallet();
  const { installed } = useInstalledXnftsLoadable();
  const { owned } = useOwnedXnftsLoadable();
  const [focused, setFocused] = useXnftFocus();

  /**
   * Memoized function to close the modal when the user clicks.
   */
  const handleModalClose = useCallback(() => setFocused(undefined), [setFocused]);

  return connected ? (
    <>
      <Layout contentClassName="flex flex-col gap-20">
        <section className="flex flex-col">
          <div className="pt-6 pb-20 text-center text-white">
            <h1 className="text-6xl font-extrabold tracking-wide">My xNFTs</h1>
          </div>

          {/* Installed xNFTs Apps */}
          <div className="flex flex-col gap-8">
            <h2 className="text-3xl font-extrabold tracking-wide text-white">Downloaded</h2>
            {installed.length === 0 ? (
              <Placeholder
                buttonHref="/"
                buttonText="Browse the Library"
                buttonIcon={<ViewGridAddIcon className="h-6 w-6" />}
                subtitle="Find xNFTs in the decentralized library."
              />
            ) : (
              <div className="flex w-full flex-col justify-center">
                <ul
                  role="list"
                  className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {installed.map((item, idx) => (
                    <li
                      key={idx}
                      className="col-span-1 rounded-lg bg-zinc-800 py-2 hover:bg-zinc-600"
                    >
                      <App profile price={item.account.installPrice.toNumber()} xnft={item} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Published xNFTs Apps */}
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
          {owned.length === 0 ? (
            <Placeholder
              buttonHref="/publish"
              buttonText="Publish new xNFT"
              buttonIcon={<PencilIcon className="h-6 w-6" />}
              subtitle="Get started by publishing your app on the decentralized xNFT library."
            />
          ) : (
            <div className="flex w-full flex-col justify-center">
              <ul role="list" className="grid grid-cols-2 gap-y-4 gap-x-6">
                {owned.map((item, idx) => (
                  <li key={idx}>
                    <App profile price={item.account.installPrice.toNumber()} xnft={item} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </Layout>
      <EditModal open={focused !== undefined} onClose={handleModalClose} />
    </>
  ) : (
    <DisconnectedPlaceholder />
  );
};

export default MePage;
