import { CashIcon, PhotographIcon, PuzzleIcon, StarIcon } from '@heroicons/react/outline';
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
};

const Sidebar: FunctionComponent<SidebarProps> = props => {
  return (
    <div className={props.className}>
      <div className="flex flex-col gap-1 rounded-2xl bg-[#27272A] p-2">
        {menuItems.map((item, idx) => (
          <div
            key={item.name}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl py-2.5 px-3 font-medium ${
              props.active === idx ? 'bg-[#FC9870] bg-opacity-20' : 'bg-transparent'
            }`}
            onClick={() => props.onClick(idx)}
          >
            <span className={props.active === idx ? 'text-[#FC9870]' : 'text-[#99A4B4]'}>
              {item.icon}
            </span>
            <span className={props.active === idx ? 'text-[#FC9870]' : 'text-[#FAFAFA]'}>
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(Sidebar);
