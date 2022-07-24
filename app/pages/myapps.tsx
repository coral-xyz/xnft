import { PublicKey } from '@solana/web3.js';
import { PencilAltIcon, ViewGridAddIcon } from '@heroicons/react/outline';
import Link from 'next/link';
import useInstalledXNFTs from '../hooks/useInstalledXNFTs';
import useOwnedXNFTs from '../hooks/useOwnedXNFTs';
import App from '../components/Library/App';

export default function MyApps() {
  const { installedXNFTs } = useInstalledXNFTs();
  const { ownedXNFTs } = useOwnedXNFTs();

  return (
    <div className="mx-auto flex flex-col gap-20">
      {/*  Primary CTA */}
      <div className="mx-auto flex flex-col gap-3 text-zinc-50">
        <h1 className="text-5xl font-extrabold tracking-wide">My xNFT Apps</h1>
      </div>

      {/* Installed xNFTs Apps */}

      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-medium tracking-wide text-zinc-50">xNFTs App</h2>

        {installedXNFTs && (
          <div className="flex  w-full flex-col justify-center">
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
                    publicKey={item.accounts.publicKey}
                    publisher={new PublicKey(item.accounts.account.publisher)}
                    installVault={new PublicKey(item.accounts.account.installVault)}
                    mode="installed"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {installedXNFTs && installedXNFTs.length === 0 && (
          <div
            className="flex h-48 w-full flex-col justify-center gap-1 rounded-xl
       border border-zinc-500 text-center"
          >
            <span className="tracking-wide text-zinc-50">No xNFTs</span>
            <span className="tracking-wide text-zinc-400">
              Find xNFTs in the decentralized library
            </span>
            <Link
              href="/library"
              className="mx-auto mt-5 flex gap-1 rounded-lg bg-teal-500
           py-2 px-3 tracking-wide text-zinc-50 hover:bg-teal-400"
            >
              <ViewGridAddIcon className="h-6 w-6" />
              <span className="font-medium">Browse the Library</span>
            </Link>
          </div>
        )}
      </div>

      {/* Published xNFTs Apps */}
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-medium tracking-wide text-zinc-50">Published xNFT Apps</h2>
        {ownedXNFTs && (
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
                    publicKey={item.accounts.publicKey}
                    publisher={new PublicKey(item.accounts.account.publisher)}
                    installVault={new PublicKey(item.accounts.account.installVault)}
                    mode="owned"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {ownedXNFTs && ownedXNFTs.length === 0 && (
          <div
            className="flex h-48 w-full flex-col justify-center gap-1 rounded-xl
       border border-zinc-500 text-center"
          >
            <span className="tracking-wide text-zinc-50">No xNFTs</span>
            <span className="tracking-wide text-zinc-400">
              Get started by publishing your app on the decentralized xNFT library.
            </span>
            <Link
              href="/publish"
              className="mx-auto mt-5 flex gap-1 rounded-lg bg-teal-500
           py-2 px-3 tracking-wide text-zinc-50 hover:bg-teal-400"
            >
              <PencilAltIcon className="h-6 w-6" />
              <span className="font-medium">Publish new xNFT </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
