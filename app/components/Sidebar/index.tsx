import { CashIcon, PhotographIcon, PuzzleIcon, StarIcon } from '@heroicons/react/outline';
// import { DownloadIcon } from '@heroicons/react/solid';
// import { Transition } from '@headlessui/react';
// import { useWallet } from '@solana/wallet-adapter-react';
import { type FunctionComponent, memo, useMemo } from 'react';

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

// const AppUpdates: FunctionComponent = () => {
//   const [updates, _setUpdates] = useState(0); // TODO:

//   return (
//     <div className="mt-4 cursor-pointer rounded-2xl bg-[#27272A] p-2">
//       <div className="flex items-center justify-between py-2.5 px-3 font-medium">
//         <span className="flex items-center gap-3">
//           <span className="text-[#99A4B4]">
//             <DownloadIcon height={18} />
//           </span>
//           <span className="text-[#FAFAFA]">Updates</span>
//         </span>
//         <span className="rounded-full bg-[#3F3F46] px-2 text-[#FAFAFA]">{updates}</span>
//       </div>
//     </div>
//   );
// };

type SidebarProps = {
  active: number;
  className?: string;
  onClick: (idx: number) => void;
};

const Sidebar: FunctionComponent<SidebarProps> = props => {
  // const { connected } = useWallet();

  const categories = useMemo(
    () =>
      menuItems.map((item, idx) => (
        <div
          key={item.name}
          className={`flex items-center gap-3 overflow-clip rounded-2xl py-2.5 px-3 font-medium ${
            props.active === idx ? 'bg-[#F97316]/20' : 'bg-transparent'
          }`}
          // onClick={() => props.onClick(idx)}
        >
          <span className={props.active === idx ? 'text-[#F97316]' : 'text-[#99A4B4]'}>
            {item.icon}
          </span>
          <span className={props.active === idx ? 'text-[#F97316]' : 'text-[#FAFAFA]'}>
            {item.name}
          </span>
          {idx !== 0 && (
            <span className="badge rounded-xl bg-[#14B8A6]/25 py-1 px-2 text-xs text-[#14B8A6]">
              soon
            </span>
          )}
        </div>
      )),
    [props.active]
  );

  return (
    <section className={props.className}>
      <div className="flex flex-col gap-1 rounded-2xl bg-[#27272A] p-2">{categories}</div>
      {/* <Transition
        appear
        show={connected}
        enter="transition ease-in-out duration-500"
        enterFrom="opacity-0 -translate-x-full"
        enterTo="opacity-100 translate-x-0"
        leave="transition ease-in-out duration-300"
        leaveFrom="opacity-100 translate-x-0"
        leaveTo="opacity-0 -translate-x-full"
      >
        <AppUpdates />
      </Transition> */}
    </section>
  );
};

export default memo(Sidebar);
