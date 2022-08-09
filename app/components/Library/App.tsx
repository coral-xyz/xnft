import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { type FunctionComponent, memo, useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import xNFT, { type XnftWithMetadata } from '../../utils/xnft';
import type { Metadata } from '../../utils/metadata';
import { useProgram } from '../../state/atoms/program';
import { useInstalledXnftsLoadable } from '../../state/atoms/xnft';
import AppPrimaryButton from '../Button/AppPrimaryButton';

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
          <AppPrimaryButton
            large
            disabled={!connected}
            installed={installed}
            price={price}
            onClick={onButtonClick}
          />
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
        <AppPrimaryButton
          disabled={!connected}
          installed={installed}
          price={price}
          onClick={onButtonClick}
        />
      </div>
    </div>
  );
};

type AppProps = {
  featured?: boolean;
  installVault: string;
  metadata: Metadata;
  price: number;
  xnft: string;
};

const App: FunctionComponent<AppProps> = ({ featured, installVault, metadata, price, xnft }) => {
  const appLink = xnft ? `/app/${xnft}` : '';

  const { connected } = useWallet();
  const program = useProgram();
  const { installed, err } = useInstalledXnftsLoadable();
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (!err) {
      setIsInstalled(
        installed.find((i: XnftWithMetadata) => i.publicKey.toBase58() === xnft) !== undefined
      );
    } else {
      console.error(err);
    }
  }, [installed, err, xnft]);

  const handleOpenApp = useCallback(() => {
    // TODO:
    alert(`OPEN ${xnft}`);
  }, [xnft]);

  const handleInstall = useCallback(async () => {
    try {
      await xNFT.install(program, new PublicKey(xnft), new PublicKey(installVault));
    } catch (err) {
      console.error(`handleInstall: ${err}`);
    }
  }, [installVault, program, xnft]);

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
