import { DownloadIcon } from '@heroicons/react/solid';
import { useWallet } from '@solana/wallet-adapter-react';
import { type FunctionComponent, memo, useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import xNFT, { type XnftWithMetadata } from '../../utils/xnft';
import type { Metadata } from '../../utils/metadata';
import { useProgram } from '../../state/atoms/program';
import { useInstalledXnftsLoadable } from '../../state/atoms/xnft';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

type FeaturedProps = {
  connected?: boolean;
  installed: boolean;
  price: number;
  metadata: Metadata;
  link: string;
  onButtonClick: () => void;
};

const Featured: FunctionComponent<FeaturedProps> = ({
  connected,
  installed,
  price,
  metadata,
  link,
  onButtonClick
}) => {
  return (
    <div className="flex items-center gap-14 rounded-2xl bg-[#27272A]">
      <div className="flex items-center">
        <Image
          className="rounded-l-2xl"
          alt="app-icon"
          src={metadata.properties.icon}
          height={400}
          width={400}
          layout="fixed"
          priority
        />
      </div>
      <div className="flex min-w-0 flex-col pr-10 tracking-wide">
        <h4 className="pb-2 font-medium text-[#99A4B4]">Featured</h4>
        <h1 className="pb-6 text-6xl font-bold text-white">{metadata.name}</h1>
        <h3 className="pb-8 font-medium text-white">{metadata.description}</h3>
        <div className="flex gap-4 text-sm font-medium">
          <button
            className="flex items-center gap-2.5 rounded-md bg-white py-2 px-4 text-[#374151]"
            onClick={onButtonClick}
            disabled={!connected}
          >
            {installed ? 'Open' : price === 0 ? 'Free' : `${price / LAMPORTS_PER_SOL} SOL`}
            {!installed && <DownloadIcon height={16} />}
          </button>
          <Link href={link}>
            <button className="rounded-md bg-[#52525B] py-2 px-4 text-[#D4D4D8]">Explore</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

type ListingProps = FeaturedProps;

const Listing: FunctionComponent<ListingProps> = ({
  connected,
  installed,
  price,
  metadata,
  link,
  onButtonClick
}) => {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-[#27272A] p-4">
      <Link href={link} className="flex items-center">
        <Image
          className="rounded-lg"
          alt="app-icon"
          src={metadata.properties.icon}
          width={64}
          height={64}
          layout="fixed"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="text-lg font-bold tracking-wide text-white">{metadata.name}</div>
        <div className="truncate text-sm tracking-wide text-[#FAFAFA]">{metadata.description}</div>
      </div>
      <div className="my-auto">
        <button
          className="flex items-center gap-2.5 rounded bg-white py-2 px-3 text-xs font-medium tracking-wide text-[#374151]"
          onClick={onButtonClick}
          disabled={!connected}
        >
          {installed ? 'Open' : price === 0 ? 'Free' : `${price / LAMPORTS_PER_SOL} SOL`}
          {!installed && <DownloadIcon height={16} />}
        </button>
      </div>
    </div>
  );
};

type AppProps = {
  publicKey: string;
  price: number;
  metadata: Metadata;
  featured?: boolean;
};

const App: FunctionComponent<AppProps> = ({ publicKey, price, metadata, featured }) => {
  const appLink = publicKey ? `/app/${publicKey}` : '';

  const { connected } = useWallet();
  const program = useProgram();
  const { installed, err } = useInstalledXnftsLoadable();
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (!err) {
      setIsInstalled(
        installed.find((i: XnftWithMetadata) => i.publicKey.toBase58() === publicKey) !== undefined
      );
    } else {
      console.error(err);
    }
  }, [installed, err, publicKey]);

  const handleOpenApp = useCallback(() => {
    // TODO:
  }, []);

  const handleInstall = useCallback(async () => {
    try {
      const x = await program.account.xnft2.fetch(publicKey);
      console.log(x.totalInstalls.toNumber());
      await xNFT.install(program, x.name, x.publisher, x.installVault);
    } catch (err) {
      console.error(`handleInstall: ${err}`);
    }
  }, [publicKey, program]);

  return featured ? (
    <Featured
      connected={connected}
      installed={isInstalled}
      price={price}
      metadata={metadata}
      link={appLink}
      onButtonClick={isInstalled ? handleOpenApp : handleInstall}
    />
  ) : (
    <Listing
      connected={connected}
      installed={isInstalled}
      price={price}
      metadata={metadata}
      link={appLink}
      onButtonClick={isInstalled ? handleOpenApp : handleInstall}
    />
  );
};

export default memo(App);
