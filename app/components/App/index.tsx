import { PublicKey } from '@solana/web3.js';
import { type FunctionComponent, memo, useCallback, useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useSetRecoilState } from 'recoil';
import dynamic from 'next/dynamic';
import xNFT, {
  type InstalledXnftWithMetadata,
  type SerializedXnftWithMetadata,
  type XnftWithMetadata
} from '../../utils/xnft';
import { useProgram } from '../../state/atoms/program';
import { forceInstalledRefresh, useInstalledXnftsLoadable } from '../../state/atoms/xnft';

const Featured = dynamic(() => import('./Featured'));
const Listing = dynamic(() => import('./Listing'));
const Profile = dynamic(() => import('./Profile'));
const NotifyExplorer = dynamic(() => import('../Notification/Explorer'));
const NotifyTransactionFailure = dynamic(() => import('../Notification/TransactionFailure'));

interface AppProps {
  featured?: boolean;
  profile?: boolean;
  type?: 'installed' | 'owned';
  xnft: XnftWithMetadata | SerializedXnftWithMetadata | InstalledXnftWithMetadata;
}

const App: FunctionComponent<AppProps> = ({ featured, profile, type, xnft }) => {
  const program = useProgram();
  const { installed, err } = useInstalledXnftsLoadable();
  const refreshInstalled = useSetRecoilState(forceInstalledRefresh);
  const [isInstalled, setIsInstalled] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Memoized value for the xNFT account public key based on the
   * type of xNFT object provided to the component.
   */
  const pubkey = useMemo(
    () => ('xnft' in xnft ? xnft.xnft.publicKey : new PublicKey(xnft.publicKey)),
    [xnft]
  );

  /**
   * Memoized href link for the app view of the current public key.
   */
  const appLink = useMemo(() => `/app/${pubkey.toBase58()}`, [pubkey]);

  /**
   * Memoized xNFT install price value to pass through props.
   */
  const price = useMemo(
    () =>
      'xnft' in xnft
        ? xnft.xnft.account.installPrice.toNumber()
        : typeof xnft.account.installPrice === 'string'
        ? parseInt(xnft.account.installPrice, 16)
        : xnft.account.installPrice.toNumber(),
    [xnft]
  );

  /**
   * Effect hook to mark whether the public key of the prop provided
   * xNFT was found in the loaded list of installed xNFTs for the connected wallet.
   */
  useEffect(() => {
    if (!err) {
      setIsInstalled(
        installed.find(
          (i: InstalledXnftWithMetadata) => i.xnft.publicKey.toBase58() === pubkey.toBase58()
        ) !== undefined
      );
    } else {
      console.error(err);
    }
  }, [installed, err, pubkey]);

  /**
   * Memoized function for opening the xNFT app in Backpack if
   * the 'Open' button is clicked.
   */
  const handleOpenApp = useCallback(() => {
    // TODO:
    alert(`OPEN ${pubkey.toBase58()}`);
  }, [pubkey]);

  /**
   * Memoized function for processing the `create_install` instruction
   * of the program when a user clicks on the app installation button.
   */
  const handleInstall = useCallback(async () => {
    setLoading(true);

    try {
      const acc = 'xnft' in xnft ? xnft.xnft : xnft;
      const sig = await xNFT.install(program, acc);
      refreshInstalled(prev => prev + 1);

      toast(<NotifyExplorer signature={sig} title={`${acc.account.name} Installed!`} />, {
        type: 'success'
      });
    } catch (err) {
      console.error(`handleInstall: ${err}`);
      toast(<NotifyTransactionFailure error={err} title="Installation Failed!" />, {
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [program, xnft, refreshInstalled]);

  return featured ? (
    <Featured
      installed={isInstalled}
      link={appLink}
      loading={loading}
      onButtonClick={isInstalled ? handleOpenApp : handleInstall}
      price={price}
      xnft={xnft as XnftWithMetadata | SerializedXnftWithMetadata}
    />
  ) : profile ? (
    <Profile
      type={type}
      link={appLink}
      onOpen={handleOpenApp}
      xnft={xnft as InstalledXnftWithMetadata}
    />
  ) : (
    <Listing
      installed={isInstalled}
      link={appLink}
      loading={loading}
      onButtonClick={isInstalled ? handleOpenApp : handleInstall}
      price={price}
      xnft={xnft as XnftWithMetadata | SerializedXnftWithMetadata}
    />
  );
};

export default memo(App);
