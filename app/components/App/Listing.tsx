import Link from 'next/link';
import Image from 'next/image';
import { memo, type FunctionComponent } from 'react';
import AppPrimaryButton from '../Button/AppPrimaryButton';
import type { Metadata } from '../../utils/metadata';

interface ListingProps {
  connected?: boolean;
  installed: boolean;
  link: string;
  loading?: boolean;
  metadata: Metadata;
  onButtonClick: () => void;
  price: number;
}

const Listing: FunctionComponent<ListingProps> = ({
  connected,
  installed,
  link,
  loading,
  metadata,
  onButtonClick,
  price
}) => {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-[#27272A] p-4 shadow-lg transition-all hover:-translate-y-1 hover:bg-[#27272A]/40">
      <Link href={link} className="flex items-center">
        <Image
          className="rounded-lg"
          alt="app-icon"
          src={metadata.image}
          height={64}
          width={64}
          layout="fixed"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="font-bold tracking-wide text-white">{metadata.name}</div>
        <div className="truncate text-xs tracking-wide text-[#FAFAFA]/75">
          {metadata.description}
        </div>
      </div>
      <div className="my-auto">
        <AppPrimaryButton
          disabled={!connected}
          installed={installed}
          loading={loading}
          onClick={onButtonClick}
          price={price}
        />
      </div>
    </div>
  );
};

export default memo(Listing);
