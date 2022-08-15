import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { type FunctionComponent, memo, useCallback, useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import xNFT, {
  type InstalledXnftWithMetadata,
  type SerializedXnftWithMetadata,
  type XnftWithMetadata
} from '../../utils/xnft';
import { useProgram } from '../../state/atoms/program';
import { useInstalledXnftsLoadable } from '../../state/atoms/xnft';

const Featured = dynamic(() => import('./Featured'));
const Listing = dynamic(() => import('./Listing'));
const Profile = dynamic(() => import('./Profile'));

type AppProps = {
  featured?: boolean;
  price: number;
  profile?: boolean;
  type?: 'installed' | 'owned';
  xnft: XnftWithMetadata | SerializedXnftWithMetadata | InstalledXnftWithMetadata;
};

const App: FunctionComponent<AppProps> = ({ featured, price, profile, type, xnft }) => {
  const { connected } = useWallet();
  const program = useProgram();
  const { installed, err } = useInstalledXnftsLoadable();
  const [isInstalled, setIsInstalled] = useState(false);

  const pubkey = useMemo(
    () => ('xnft' in xnft ? xnft.xnft.publicKey : new PublicKey(xnft.publicKey)),
    [xnft]
  );
  const appLink = useMemo(() => `/app/${pubkey.toBase58()}`, [pubkey]);

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
    try {
      const acc = 'xnft' in xnft ? xnft.xnft : xnft;
      await xNFT.install(program, acc);
    } catch (err) {
      console.error(`handleInstall: ${err}`);
    }
  }, [program, xnft]);

  return featured ? (
    <Featured
      connected={connected}
      installed={isInstalled}
      price={price}
      metadata={(xnft as XnftWithMetadata | SerializedXnftWithMetadata).metadata}
      link={appLink}
      onButtonClick={isInstalled ? handleOpenApp : handleInstall}
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
      connected={connected}
      installed={isInstalled}
      price={price}
      metadata={(xnft as XnftWithMetadata | SerializedXnftWithMetadata).metadata}
      link={appLink}
      onButtonClick={isInstalled ? handleOpenApp : handleInstall}
    />
  );
};

export default memo(App);
