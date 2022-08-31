import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import Image from 'next/image';
import { memo, type FunctionComponent } from 'react';
import AppPrimaryButton from '../Button/AppPrimaryButton';
import type { SerializedXnftWithMetadata, XnftWithMetadata } from '../../utils/xnft';

interface FeaturedProps {
  installed: boolean;
  link: string;
  loading?: boolean;
  onButtonClick: () => void;
  price: number;
  xnft: XnftWithMetadata | SerializedXnftWithMetadata;
}

const Featured: FunctionComponent<FeaturedProps> = ({
  installed,
  link,
  loading,
  onButtonClick,
  price,
  xnft
}) => {
  const { connected } = useWallet();

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-[#27272A] shadow-lg md:flex-row md:items-center md:gap-14">
      <div className="hidden items-center md:flex">
        <Image
          className="rounded-l-2xl"
          alt="app-icon"
          src={xnft.metadata.image.replace('ipfs://', 'https://nftstorage.link/ipfs/')}
          height={400}
          width={400}
          layout="fixed"
          priority
        />
      </div>
      <div className="w-full md:hidden">
        <Image
          className="rounded-t-2xl"
          alt="app-icon"
          src={xnft.metadata.image.replace('ipfs://', 'https://nftstorage.link/ipfs/')}
          height={400}
          width={400}
          layout="responsive"
          priority
        />
      </div>
      <div className="flex flex-col px-8 py-6 tracking-wide md:px-0 md:pr-10">
        <h4 className="pb-2 text-sm font-medium text-[#99A4B4] lg:text-base">Featured</h4>
        <h1 className="pb-6 text-4xl font-bold text-white lg:text-6xl">{xnft.account.name}</h1>
        <h3 className="pb-8 text-sm font-medium text-white lg:text-base">
          {xnft.metadata.description}
        </h3>
        <div className="flex gap-4 text-sm font-medium">
          <AppPrimaryButton
            large
            disabled={!connected}
            installed={installed}
            loading={loading}
            onClick={onButtonClick}
            price={price}
          />
          <Link href={link}>
            <button className="rounded-md bg-[#52525B] py-2 px-4 text-[#D4D4D8]">Explore</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default memo(Featured);
