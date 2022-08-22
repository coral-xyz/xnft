import Link from 'next/link';
import { type FunctionComponent, memo, type ReactNode } from 'react';

interface ProfileAppListProps {
  buttonIcon: ReactNode;
  buttonHref: string;
  buttonText: string;
  subtitle: string;
}

const ProfileAppList: FunctionComponent<ProfileAppListProps> = props => {
  return (
    <div
      className="flex h-48 w-full flex-col justify-center gap-1 rounded-xl
        border border-[#374151] text-center"
    >
      <span className="tracking-wide text-[#F9FAFB]">No xNFTs</span>
      <span className="tracking-wide text-[#9CA3AF]">{props.subtitle}</span>
      <Link
        href={props.buttonHref}
        className="mx-auto mt-5 flex gap-2 rounded-lg bg-[#0D9488]
          py-2 px-3 tracking-wide text-white"
      >
        {props.buttonIcon}
        <span className="font-medium">{props.buttonText}</span>
      </Link>
    </div>
  );
};

export default memo(ProfileAppList);
