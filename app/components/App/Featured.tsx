import Link from 'next/link';
import Image from 'next/image';
import { memo, type FunctionComponent } from 'react';
import AppPrimaryButton from '../Button/AppPrimaryButton';
import type { SerializedXnftWithMetadata, XnftWithMetadata } from '../../utils/xnft';

interface FeaturedProps {
  connected?: boolean;
  installed: boolean;
  link: string;
  loading?: boolean;
  onButtonClick: () => void;
  price: number;
  xnft: XnftWithMetadata | SerializedXnftWithMetadata;
}

const Featured: FunctionComponent<FeaturedProps> = ({
  connected,
  installed,
  link,
  loading,
  onButtonClick,
  price,
  xnft
}) => {
  return (
    <div className="flex items-center gap-14 rounded-2xl bg-[#27272A] shadow-lg">
      <div className="flex items-center">
        <Image
          className="rounded-l-2xl"
          alt="app-icon"
          src={xnft.metadata.image}
          height={400}
          width={400}
          layout="fixed"
          priority
        />
      </div>
      <div className="flex min-w-0 flex-col pr-10 tracking-wide">
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
