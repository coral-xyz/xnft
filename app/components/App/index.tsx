import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { type FunctionComponent, memo, useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import xNFT, { type XnftWithMetadata } from '../../utils/xnft';
import type { Metadata } from '../../utils/metadata';
import { useProgram } from '../../state/atoms/program';
import { useInstalledXnftsLoadable } from '../../state/atoms/xnft';

const Featured = dynamic(() => import('./Featured'));
const Listing = dynamic(() => import('./Listing'));
const Profile = dynamic(() => import('./Profile'));

type AppProps = {
  featured?: boolean;
  installVault: string;
  metadata: Metadata;
  price: number;
  profile?: boolean;
  xnft: string;
};

const App: FunctionComponent<AppProps> = ({
  featured,
  installVault,
  metadata,
  price,
  profile,
  xnft
}) => {
  const appLink = xnft ? `/app/${xnft}` : '';

  const { connected } = useWallet();
  const program = useProgram();
  const { installed, err } = useInstalledXnftsLoadable();
  const [isInstalled, setIsInstalled] = useState(false);

  /**
   * Effect hook to mark whether the public key of the prop provided
   * xNFT was found in the loaded list of installed xNFTs for the connected wallet.
   */
  useEffect(() => {
    if (!err) {
      setIsInstalled(
        installed.find((i: XnftWithMetadata) => i.publicKey.toBase58() === xnft) !== undefined
      );
    } else {
      console.error(err);
    }
  }, [installed, err, xnft]);

  /**
   * Memoized function for opening the xNFT app in Backpack if
   * the 'Open' button is clicked.
   */
  const handleOpenApp = useCallback(() => {
    // TODO:
    alert(`OPEN ${xnft}`);
  }, [xnft]);

  /**
   * Memoized function for processing the `create_install` instruction
   * of the program when a user clicks on the app installation button.
   */
  const handleInstall = useCallback(async () => {
    try {
      await xNFT.install(program, new PublicKey(xnft), new PublicKey(installVault));
    } catch (err) {
      console.error(`handleInstall: ${err}`);
    }
  }, [installVault, program, xnft]);

  return featured ? (
    <Featured
      connected={connected}
      installed={isInstalled}
      price={price}
      metadata={metadata}
      link={appLink}
      onButtonClick={isInstalled ? handleOpenApp : handleInstall}
    />
  ) : profile ? (
    <Profile link={appLink} metadata={metadata} onOpen={handleOpenApp} />
  ) : (
    <Listing
      connected={connected}
      installed={isInstalled}
      price={price}
      metadata={metadata}
      link={appLink}
      onButtonClick={isInstalled ? handleOpenApp : handleInstall}
    />
  );
};

export default memo(App);
