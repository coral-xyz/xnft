import { DownloadIcon } from '@heroicons/react/solid';
import { BN } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { type FunctionComponent, memo, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import Image from 'next/image';
import Link from 'next/link';
import xNFT from '../../utils/xnft';
import type { Metadata } from '../../utils/metadata';
import { programState } from '../../state/atoms/solana';

type FeaturedProps = {
  allowInstall?: boolean;
  price: BN;
  metadata: Metadata;
  link: string;
  onInstallClick: () => void;
};

const Featured: FunctionComponent<FeaturedProps> = ({
  allowInstall,
  price,
  metadata,
  link,
  onInstallClick
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
        />
      </div>
      <div className="flex min-w-0 flex-col pr-10 tracking-wide">
        <h3 className="pb-2 font-medium text-[#99A4B4]">Featured</h3>
        <h1 className="pb-6 text-6xl font-bold text-white">{metadata.name}</h1>
        <h3 className="pb-8 font-medium text-white">{metadata.description}</h3>
        <div className="flex gap-4 text-sm font-medium">
          <button
            className="flex items-center gap-2.5 rounded-md bg-white py-2 px-4 text-[#374151]"
            onClick={onInstallClick}
            disabled={!allowInstall}
          >
            {price.isZero() ? 'Free' : `${price.toNumber()} SOL`} <DownloadIcon height={16} />
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
  allowInstall,
  price,
  metadata,
  link,
  onInstallClick
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
          className="flex items-center gap-2.5 rounded bg-white py-2 px-3 text-xs
            font-medium tracking-wide text-[#374151] text-white"
          onClick={onInstallClick}
          disabled={!allowInstall}
        >
          {price.isZero() ? 'Free' : `${price.toNumber()} SOL`} <DownloadIcon height={16} />
        </button>
      </div>
    </div>
  );
};

type AppProps = {
  publicKey: string;
  price: BN;
  metadata: Metadata;
  featured?: boolean;
};

const App: FunctionComponent<AppProps> = ({ publicKey, price, metadata, featured }) => {
  const appLink = publicKey ? `/app/${publicKey}` : '';

  const { connected } = useWallet();
  const program = useRecoilValue(programState);

  const handleInstall = useCallback(async () => {
    try {
      const { installVault, name, publisher } = await program.account.xnft2.fetch(publicKey);
      await xNFT.install(program, name, publisher, installVault);
    } catch (err) {
      console.error(`handleInstall: ${err}`);
    }
  }, [publicKey, program]);

  return featured ? (
    <Featured
      allowInstall={connected}
      price={price}
      metadata={metadata}
      link={appLink}
      onInstallClick={handleInstall}
    />
  ) : (
    <Listing
      allowInstall={connected}
      price={price}
      metadata={metadata}
      link={appLink}
      onInstallClick={handleInstall}
    />
  );
};

export default memo(App);
