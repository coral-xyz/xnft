import { DownloadIcon } from '@heroicons/react/solid';
import { type FunctionComponent, memo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { findXNFTMintPDA } from '../../utils/xnft';
import type { Metadata } from '../../utils/metadata';
import { useProgram } from '../../state/hooks/solana';

type FeaturedProps = {
  metadata: Metadata;
  link: string;
  onInstallClick: () => void;
};

const Featured: FunctionComponent<FeaturedProps> = ({ metadata, link, onInstallClick }) => {
  return (
    <div className="flex items-center gap-14 rounded-2xl bg-[#27272A]">
      <Image
        className="rounded-l-2xl"
        alt="app-icon"
        src={metadata.properties.icon}
        blurDataURL="/brands/aurory.jpg" //TODO: fix me
        placeholder="blur"
        height={400}
        width={400}
      />
      <div className="flex flex-col py-12 pr-10 tracking-wide">
        <h3 className="pb-2 font-medium text-[#99A4B4]">Featured</h3>
        <h1 className="pb-6 text-6xl font-bold text-white">{metadata.name}</h1>
        <h3 className="pb-8 font-medium text-white">{metadata.description}</h3>

        <div className="flex gap-4 text-sm font-medium">
          <button
            className="flex items-center gap-2.5 rounded-md bg-white py-2 px-4 text-[#374151]"
            onClick={onInstallClick}
          >
            Free <DownloadIcon height={16} />
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

const Listing: FunctionComponent<ListingProps> = ({ metadata, link, onInstallClick }) => {
  return (
    <div className="flex w-full items-center justify-between rounded-lg bg-[#27272A] p-4">
      <Link className="w-10/12" href={link}>
        <div className="flex items-center gap-4">
          <Image
            className="rounded-2xl"
            alt="app-icon"
            src={metadata.properties.icon}
            blurDataURL="/brands/aurory.jpg" //TODO: fix me
            placeholder="blur"
            width={64}
            height={64}
          />
          <div>
            <div className="text-lg font-bold tracking-wide text-white">{metadata.name}</div>
            <div className="text-sm tracking-wide text-[#FAFAFA]">{metadata.description}</div>
          </div>
        </div>
      </Link>
      <button
        className="flex items-center gap-2.5 rounded bg-white py-2 px-3
          text-xs font-medium tracking-wide text-[#374151] text-white"
        onClick={onInstallClick}
      >
        Free <DownloadIcon height={16} />
      </button>
    </div>
  );
};

type AppProps = {
  publicKey: string;
  metadata: Metadata;
  featured?: boolean;
};

const App: FunctionComponent<AppProps> = ({ publicKey, metadata, featured }) => {
  const appLink = publicKey ? `/app/${publicKey}` : '';
  const program = useProgram();

  const handleInstall = useCallback(async () => {
    try {
      const { installVault, name, publisher } = await program.account.xnft2.fetch(publicKey);
      const xnft = await findXNFTMintPDA(publisher, name);

      await program.methods
        .createInstall()
        .accounts({
          xnft,
          installVault
        })
        .rpc();
    } catch (err) {
      console.error(`handleInstall: ${err}`);
    }
  }, [publicKey, program]);

  return featured ? (
    <Featured metadata={metadata} link={appLink} onInstallClick={handleInstall} />
  ) : (
    <Listing metadata={metadata} link={appLink} onInstallClick={handleInstall} />
  );
};

export default memo(App);
