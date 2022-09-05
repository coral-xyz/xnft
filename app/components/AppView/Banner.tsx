import { useWallet } from '@solana/wallet-adapter-react';
import { type FunctionComponent, memo, useMemo, useCallback, useState, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import xNFT, {
  type InstalledXnftWithMetadata,
  type SerializedXnftWithMetadata
} from '../../utils/xnft';
import { useProgram } from '../../state/atoms/program';
import { forceInstalledRefresh, useInstalledXnftsLoadable } from '../../state/atoms/xnft';
import { toast } from 'react-toastify';

const AppPrimaryButton = dynamic(() => import('../Button/AppPrimaryButton'));
const NotifyExplorer = dynamic(() => import('../Notification/Explorer'));
const NotifyTransactionFailure = dynamic(() => import('../Notification/TransactionFailure'));
const Rating = dynamic(() => import('../Rating/Static'));

interface AppBannerProps {
  xnft: SerializedXnftWithMetadata;
}

const AppBanner: FunctionComponent<AppBannerProps> = ({ xnft }) => {
  const program = useProgram();
  const { connected } = useWallet();
  const { installed, err } = useInstalledXnftsLoadable();
  const refreshInstalled = useSetRecoilState(forceInstalledRefresh);
  const [isInstalled, setIsInstalled] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Effect hook to mark whether the public key of the prop provided
   * xNFT was found in the loaded list of installed xNFTs for the connected wallet.
   */
  useEffect(() => {
    if (!err) {
      setIsInstalled(
        installed.find(
          (i: InstalledXnftWithMetadata) => i.xnft.publicKey.toBase58() === xnft.publicKey
        ) !== undefined
      );
    } else {
      console.error(err);
    }
  }, [installed, err, xnft]);

  /**
   * Memoized value for the app price in lamports.
   */
  const priceLamports = useMemo(
    () => parseInt(xnft.account.installPrice, 16),
    [xnft.account.installPrice]
  );

  /**
   * Memoized value for the number of total downloads.
   */
  const totalDownloads = useMemo(
    () => parseInt(xnft.account.totalInstalls, 16).toLocaleString(),
    [xnft.account.totalInstalls]
  );

  /**
   * Memoized value of the xNFT's average rating from account data.
   */
  const averageRating = useMemo(
    () =>
      xnft.account.numRatings === 0
        ? 0
        : parseInt(xnft.account.totalRating, 16) / xnft.account.numRatings,
    [xnft.account.totalRating, xnft.account.numRatings]
  );

  /**
   * Memoized function to handle the button to launch the app
   * in the connected Backpack wallet extension.
   */
  const handleOpenApp = useCallback(() => {
    // TODO:
  }, []);

  /**
   * Memoized function to handle the install button click
   * to execute the contract instruction.
   */
  const handleInstall = useCallback(async () => {
    setLoading(true);

    try {
      const sig = await xNFT.install(program, xnft);
      refreshInstalled(prev => prev + 1);

      toast(<NotifyExplorer signature={sig} title={`${xnft.account.name} Installed!`} />, {
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

  /**
   * Memoized function to handle clicking the app preview button.
   */
  const handlePreviewClick = useCallback(() => {
		window.backpack.openXnft(xnft.publicKey);
  }, [xnft]);

  return (
    <section className="flex gap-6">
      <Image
        className="col-span-1 rounded-lg"
        alt="app-icon"
        src={xnft.metadata.image.replace('ipfs://', 'https://nftstorage.link/ipfs/')}
        width={100}
        height={100}
        layout="fixed"
      />

      <div className="flex flex-col items-start gap-4">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-semibold tracking-wide text-white">
            {xnft.metadata.name}
          </span>
          {xnft.account.suspended && (
            <span className="badge rounded-xl bg-red-400/25 py-1 px-2 text-xs text-red-400">
              suspended
            </span>
          )}
        </div>
        <div className="max-w-md text-lg font-medium text-[#99A4B4]">
          {xnft.metadata.description}
        </div>
        <Rating rating={averageRating} total={xnft.account.numRatings} />
        <div className="flex items-center gap-4">
          <AppPrimaryButton
            className="bg-[#4F46E5] text-white"
            disabled={!connected}
            installed={isInstalled}
            loading={loading}
            onClick={isInstalled ? handleOpenApp : handleInstall}
            price={priceLamports}
          />
          <button
            className="rounded bg-[#27272A] px-3 py-2 text-xs font-medium tracking-wide text-white"
            onClick={handlePreviewClick}
            disabled={!connected}
          >
            Preview
          </button>
          <span className="rounded-2xl bg-[#4F46E5] px-3 py-1 text-xs font-medium tracking-wide text-white">
            {totalDownloads} Downloads
          </span>
        </div>
      </div>
    </section>
  );
};

export default memo(AppBanner);
