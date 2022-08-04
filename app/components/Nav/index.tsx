import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { type FunctionComponent, memo, useCallback, useEffect } from 'react';
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { anchorWalletState } from '../../state/atoms/solana';
// import Search from './Search';
import { DocsLink } from './Links';
import { ConnectedMenu, DisconnectedMenu } from './WalletMenus';

const Nav: FunctionComponent = () => {
  const router = useRouter();
  const { connected, disconnect } = useWallet();
  const anchorWallet = useAnchorWallet();
  const setWallet = useSetRecoilState(anchorWalletState);
  const resetWallet = useResetRecoilState(anchorWalletState);
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
    <nav className="tracking-wide">
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
    </nav>
  );
};

export default memo(Nav);
