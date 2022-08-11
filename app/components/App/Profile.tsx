import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { type FunctionComponent, memo, type ReactNode, useCallback } from 'react';
import { useXnftFocus } from '../../state/atoms/edit';
import type { XnftWithMetadata } from '../../utils/xnft';

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
  onOpen: () => void;
  xnft: XnftWithMetadata;
};

const Profile: FunctionComponent<ProfileProps> = ({ link, onOpen, xnft }) => {
  const router = useRouter();
  const [_, setFocused] = useXnftFocus();

  const handleClickDetails = useCallback(() => router.push(link), [link, router]);
  const handleClickEdit = useCallback(() => setFocused(xnft), [setFocused, xnft]);

  return (
    <div className="flex items-center gap-4 rounded-xl bg-[#27272A] p-4 shadow-lg transition-all hover:-translate-y-1 hover:bg-[#27272A]/40">
      <Link href={link} className="self-start">
        <Image
          className="rounded-lg"
          alt="app-icon"
          src={xnft.metadata.properties.icon}
          height={64}
          width={64}
          layout="fixed"
        />
      </Link>
      <div className="pt-2">
        <div className="text-lg font-bold tracking-wide text-white">{xnft.metadata.name}</div>
        <div className="truncate text-sm tracking-wide text-[#FAFAFA]">
          {xnft.metadata.description}
        </div>
        <div className="mt-4 flex gap-3">
          <MetaButton onClick={onOpen}>Open</MetaButton>
          <MetaButton onClick={handleClickDetails}>Details</MetaButton> {/* FIXME: */}
          <MetaButton onClick={handleClickEdit}>Edit</MetaButton>
        </div>
      </div>
    </div>
  );
};

export default memo(Profile);
