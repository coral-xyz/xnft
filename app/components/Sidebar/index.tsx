import { CashIcon, PhotographIcon, PuzzleIcon, StarIcon } from '@heroicons/react/outline';
import { DownloadIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { type FunctionComponent, memo } from 'react';

const menuItems = [
  {
    name: 'Explore',
    icon: <StarIcon height={18} />
  },
  {
    name: 'NFTs',
    icon: <PhotographIcon height={18} />
  },
  {
    name: 'Games',
    icon: <PuzzleIcon height={18} />
  },
  {
    name: 'Finance',
    icon: <CashIcon height={18} />
  }
];

type SidebarProps = {
  active: number;
  className?: string;
  onClick: (idx: number) => void;
  updates?: number;
};

const Sidebar: FunctionComponent<SidebarProps> = props => {
  const router = useRouter();

  return (
    <div className={props.className}>
      <div className="flex flex-col gap-1 rounded-2xl bg-[#27272A] p-2">
        {menuItems.map((item, idx) => (
          <div
            key={item.name}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl py-2.5 px-3 font-medium ${
              props.active === idx ? 'bg-[#F97316] bg-opacity-20' : 'bg-transparent'
            }`}
            onClick={() => props.onClick(idx)}
          >
            <span className={props.active === idx ? 'text-[#F97316]' : 'text-[#99A4B4]'}>
              {item.icon}
            </span>
            <span className={props.active === idx ? 'text-[#F97316]' : 'text-[#FAFAFA]'}>
              {item.name}
            </span>
          </div>
        ))}
      </div>

      {router.pathname === '/me' && (
        <div className="mt-4 flex flex-col gap-1 rounded-2xl bg-[#27272A] p-2">
          <div className="flex cursor-pointer items-center gap-3 rounded-2xl bg-[#27272A] py-2.5 px-3 font-medium text-[#99A4B4]">
            <span className="text-[#99A4B4]">
              <DownloadIcon height={14} />
            </span>
            <span className="flex-1 text-[#FAFAFA]">Updates</span>
            <span className="rounded-full bg-[#3F3F46] px-2 text-[#FAFAFA]">
              {props.updates ?? 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(Sidebar);
