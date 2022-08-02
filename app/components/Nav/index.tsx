import {
  ChevronDownIcon,
  ClipboardCopyIcon,
  CodeIcon,
  LogoutIcon,
  UserCircleIcon
} from '@heroicons/react/solid';
import { Menu, Transition } from '@headlessui/react';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { type FunctionComponent, memo, Fragment, useEffect, useCallback } from 'react';
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { connectedWallet } from '../../state/atoms/solana';
// import Search from './Search';
import { DocsLink, DownloadBackpackLink } from './Links';

function truncatePublicKey(pk: string): string {
  return `${pk.slice(0, 5)}...${pk.slice(-5)}`;
}

const DisconnectedMenu: FunctionComponent = () => {
  const { setVisible } = useWalletModal();

  return (
    <>
      <DownloadBackpackLink />
      <button
        className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-[#E379B3] to-[#E1B43F] px-4 py-3 text-white"
        onClick={() => setVisible(true)}
      >
        <UserCircleIcon height={18} /> Connect
      </button>
    </>
  );
};

type ConnectedMenuProps = {
  onDisconnect: () => void;
};

const ConnectedMenu: FunctionComponent<ConnectedMenuProps> = ({ onDisconnect }) => {
  const { publicKey } = useWallet();

  return (
    <Menu as="div" className="relative inline-block">
      <Menu.Button
        className="flex items-center gap-3 rounded-3xl bg-[#27272A]
          px-4 py-3 font-medium tracking-wide text-[#FAFAFA]"
      >
        <UserCircleIcon height={20} /> {truncatePublicKey(publicKey.toBase58())}{' '}
        <ChevronDownIcon height={20} />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 origin-top-right rounded-lg bg-[#27272A] p-1 text-sm text-white shadow-lg">
          <Menu.Item>
            {({ active }) => (
              <Link href="/me">
                <button
                  className={`${
                    active ? 'bg-[#52525B]' : ''
                  } flex w-full items-center gap-3 rounded-lg px-3 py-2`}
                >
                  <CodeIcon height={14} /> My xNFTs
                </button>
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? 'bg-[#52525B]' : ''
                } flex w-full items-center gap-3 rounded-lg px-3 py-2`}
                onClick={() => navigator.clipboard.writeText(publicKey.toBase58())}
              >
                <ClipboardCopyIcon height={14} /> Copy Address
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? 'bg-[#52525B]' : ''
                } flex w-full items-center gap-3 rounded-lg px-3 py-2`}
                onClick={onDisconnect}
              >
                <LogoutIcon height={14} /> Disconnect
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

const Nav: FunctionComponent = () => {
  const router = useRouter();
  const { connected, disconnect } = useWallet();
  const anchorWallet = useAnchorWallet();
  const setWallet = useSetRecoilState(connectedWallet);
  const resetWallet = useResetRecoilState(connectedWallet);
  // const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (connected) {
      setWallet(anchorWallet);
    } else {
      resetWallet();
    }
  }, [anchorWallet, connected, setWallet, resetWallet]);

  const handleDisconnect = useCallback(async () => {
    if (router.pathname !== '/') {
      await router.push('/');
    }
    await disconnect();
  }, [disconnect, router]);

  return (
    <div className="tracking-wide">
      <div className="flex items-center">
        <div className="flex flex-1 items-center gap-36">
          <Link href="/">
            <h1 className="text-3xl font-bold text-white">xNFT Library</h1>
          </Link>
          {/* <Search value={searchValue} onChange={setSearchValue} /> */}
        </div>

        <div className="flex items-center justify-end gap-3">
          <DocsLink />
          {connected ? <ConnectedMenu onDisconnect={handleDisconnect} /> : <DisconnectedMenu />}
        </div>
      </div>
    </div>
  );
};

export default memo(Nav);
