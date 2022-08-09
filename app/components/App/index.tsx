import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { type FunctionComponent, memo, useCallback, useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import xNFT, { type SerializedXnftWithMetadata, type XnftWithMetadata } from '../../utils/xnft';
import { useProgram } from '../../state/atoms/program';
import { useInstalledXnftsLoadable } from '../../state/atoms/xnft';

const Featured = dynamic(() => import('./Featured'));
const Listing = dynamic(() => import('./Listing'));
const Profile = dynamic(() => import('./Profile'));

type AppProps = {
  featured?: boolean;
  price: number;
  profile?: boolean;
  xnft: XnftWithMetadata | SerializedXnftWithMetadata;
};

const App: FunctionComponent<AppProps> = ({ featured, price, profile, xnft }) => {
  const { connected } = useWallet();
  const program = useProgram();
  const { installed, err } = useInstalledXnftsLoadable();
  const [isInstalled, setIsInstalled] = useState(false);

  const pubkey = useMemo(() => new PublicKey(xnft.publicKey), [xnft]);
  const appLink = useMemo(() => `/app/${pubkey.toBase58()}`, [pubkey]);

  /**
   * Effect hook to mark whether the public key of the prop provided
   * xNFT was found in the loaded list of installed xNFTs for the connected wallet.
   */
  useEffect(() => {
    if (!err) {
      setIsInstalled(
        installed.find((i: XnftWithMetadata) => i.publicKey.toBase58() === pubkey.toBase58()) !==
          undefined
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
  }, [xnft]);

  /**
   * Memoized function for processing the `create_install` instruction
   * of the program when a user clicks on the app installation button.
   */
  const handleInstall = useCallback(async () => {
    try {
      await xNFT.install(program, xnft);
    } catch (err) {
      console.error(`handleInstall: ${err}`);
    }
  }, [program, xnft]);

  return featured ? (
    <Featured
      connected={connected}
      installed={isInstalled}
      price={price}
      metadata={xnft.metadata}
      link={appLink}
      onButtonClick={isInstalled ? handleOpenApp : handleInstall}
    />
  ) : profile ? (
    <Profile link={appLink} onOpen={handleOpenApp} xnft={xnft as XnftWithMetadata} />
  ) : (
    <Listing
      connected={connected}
      installed={isInstalled}
      price={price}
      metadata={xnft.metadata}
      link={appLink}
      onButtonClick={isInstalled ? handleOpenApp : handleInstall}
    />
  );
};

export default memo(App);
