import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { type FunctionComponent, memo, type ReactNode } from 'react';
import { Metadata } from '../../utils/metadata';

type MetaButtonProps = {
  children?: ReactNode;
  onClick: () => void;
};

const MetaButton: FunctionComponent<MetaButtonProps> = ({ children, onClick }) => {
  return (
    <button
      className="rounded bg-[#52525B] py-2 px-3 text-xs font-medium tracking-wide text-white"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

type ProfileProps = {
  link: string;
  metadata: Metadata;
  onOpen: () => void;
};

const Profile: FunctionComponent<ProfileProps> = ({ link, metadata, onOpen }) => {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4 rounded-xl bg-[#27272A] p-4">
      <Link href={link} className="self-start">
        <Image
          className="rounded-lg"
          alt="app-icon"
          src={metadata.properties.icon}
          height={64}
          width={64}
          layout="fixed"
        />
      </Link>
      <div className="pt-2">
        <div className="text-lg font-bold tracking-wide text-white">{metadata.name}</div>
        <div className="truncate text-sm tracking-wide text-[#FAFAFA]">{metadata.description}</div>
        <div className="mt-4 flex gap-3">
          <MetaButton onClick={onOpen}>Open</MetaButton>
          <MetaButton onClick={() => router.push(link)}>Details</MetaButton> {/* FIXME: */}
          <MetaButton onClick={() => {}}>Edit</MetaButton>
        </div>
      </div>
    </div>
  );
};

export default memo(Profile);
