import Link from 'next/link';
import Image from 'next/image';
import { memo, type FunctionComponent } from 'react';
import AppPrimaryButton from '../Button/AppPrimaryButton';
import type { Metadata } from '../../utils/metadata';

type ListingProps = {
  connected?: boolean;
  installed: boolean;
  price: number;
  metadata: Metadata;
  link: string;
  onButtonClick: () => void;
};

const Listing: FunctionComponent<ListingProps> = ({
  connected,
  installed,
  price,
  metadata,
  link,
  onButtonClick
}) => {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-[#27272A] p-4 shadow-lg transition-all hover:-translate-y-1 hover:bg-[#27272A]/40">
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

export default memo(Listing);
