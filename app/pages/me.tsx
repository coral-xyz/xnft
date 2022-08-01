import { PencilAltIcon, ViewGridAddIcon } from '@heroicons/react/outline';
import { type FunctionComponent, useState, type ReactNode } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useInstalledXNFTs from '../hooks/useInstalledXNFTs';
import useOwnedXNFTs from '../hooks/useOwnedXNFTs';
import App from '../components/Library/App';

const Sidebar = dynamic(() => import('../components/Sidebar'));

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
        className="mx-auto mt-5 flex gap-1 rounded-lg bg-[#0D9488]
          py-2 px-3 tracking-wide text-white"
      >
        {props.buttonIcon}
        <span className="font-medium">{props.buttonText}</span>
      </Link>
    </div>
  );
};

const MePage: NextPage = () => {
  const { installedXNFTs } = useInstalledXNFTs();
  const { ownedXNFTs } = useOwnedXNFTs();
  const [activeMenu, setActiveMenu] = useState(0);

  return (
    <div className="grid grid-cols-4 gap-16">
      <Sidebar active={activeMenu} onClick={setActiveMenu} />

      <div className="col-span-3 flex flex-col gap-20">
        <div className="flex flex-col gap-10">
          <div className="pt-14 pb-20 text-center text-white">
            <h1 className="text-6xl font-extrabold tracking-wide">My xNFTs</h1>
          </div>

          {/* Installed xNFTs Apps */}
          <div className="flex flex-col gap-8">
            <h2 className="text-3xl font-extrabold tracking-wide text-white">Installed</h2>
            {installedXNFTs.length === 0 ? (
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
                  {installedXNFTs.map((item, index) => (
                    <li
                      key={index}
                      className="col-span-1 rounded-lg bg-zinc-800 py-2 hover:bg-zinc-600"
                    >
                      <App
                        iconUrl={item.metadata.properties.icon}
                        name={item.metadata.name}
                        description={item.metadata.description}
                        publicKey={item.publicKey.toBase58()}
                        publisher={item.account.publisher.toBase58()}
                        installVault={item.account.installVault.toBase58()}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Published xNFTs Apps */}
        <div className="flex flex-col gap-8">
          <h2 className="text-3xl font-extrabold tracking-wide text-white">Published</h2>
          {ownedXNFTs.length === 0 ? (
            <Placeholder
              buttonHref="/publish"
              buttonText="Publish new xNFT"
              buttonIcon={<PencilAltIcon className="h-6 w-6" />}
              subtitle="Get started by publishing your app on the decentralized xNFT library."
            />
          ) : (
            <div className="flex  w-full flex-col justify-center">
              <ul
                role="list"
                className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {ownedXNFTs.map((item, index) => (
                  <li
                    key={index}
                    className="col-span-1 rounded-lg bg-zinc-800 py-2 hover:bg-zinc-600"
                  >
                    <App
                      iconUrl={item.metadata.properties.icon}
                      name={item.metadata.name}
                      description={item.metadata.description}
                      publicKey={item.publicKey.toBase58()}
                      publisher={item.account.publisher.toBase58()}
                      installVault={item.account.installVault.toBase58()}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MePage;
