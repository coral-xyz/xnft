import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { type FunctionComponent, memo, useCallback, useEffect, useMemo } from 'react';
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

  /**
   * Component effect to set or reset the recoil wallet
   * state based on the values of the wallet adapter context.
   */
  useEffect(() => {
    if (connected) {
      setWallet(anchorWallet);
    } else {
      resetWallet();
    }
  }, [anchorWallet, connected, setWallet, resetWallet]);

  /**
   * Memoized function to handle the routing and wallet disconnecting
   * when clicked in the menu.
   */
  const handleDisconnect = useCallback(async () => {
    if (router.pathname !== '/') {
      await router.push('/');
    }
    await disconnect();
  }, [disconnect, router]);

  /**
   * Memoized value of the menu type to display
   * based on the wallet connection status.
   */
  const menu = useMemo(
    () => (connected ? <ConnectedMenu onDisconnect={handleDisconnect} /> : <DisconnectedMenu />),
    [connected, handleDisconnect]
  );

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
          {menu}
        </div>
      </div>
    </nav>
  );
};

export default memo(Nav);
