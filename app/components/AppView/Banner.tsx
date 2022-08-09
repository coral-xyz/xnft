import { PublicKey } from '@solana/web3.js';
import { type FunctionComponent, memo, useMemo, useCallback, useState, useEffect } from 'react';
import { BadgeCheckIcon } from '@heroicons/react/solid';
import { useWallet } from '@solana/wallet-adapter-react';
import Image from 'next/image';
import xNFT, { type XnftWithMetadata, type SerializedXnftWithMetadata } from '../../utils/xnft';
import { useProgram } from '../../state/atoms/program';
import { useInstalledXnftsLoadable } from '../../state/atoms/xnft';
import AppPrimaryButton from '../Button/AppPrimaryButton';

type AppBannerProps = {
  xnft: SerializedXnftWithMetadata;
};

const AppBanner: FunctionComponent<AppBannerProps> = ({ xnft }) => {
  const program = useProgram();
  const { connected } = useWallet();
  const { installed, err } = useInstalledXnftsLoadable();
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (!err) {
      setIsInstalled(
        installed.find((i: XnftWithMetadata) => i.publicKey.toBase58() === xnft.publicKey) !==
          undefined
      );
    } else {
      console.error(err);
    }
  }, [installed, err, xnft]);

  const price = useMemo(() => parseInt(xnft.account.installPrice, 16), [xnft.account.installPrice]);

  const handleOpenApp = useCallback(() => {
    // TODO:
  }, []);

  const handleInstall = useCallback(async () => {
    try {
      await xNFT.install(
        program,
        xnft.metadata.name,
        new PublicKey(xnft.account.publisher),
        new PublicKey(xnft.account.installVault)
      );
    } catch (err) {
      console.error(`handleInstall: ${err}`);
    }
  }, [program, xnft]);

  return (
    <section className="flex gap-6">
      <Image
        className="col-span-1 rounded-lg"
        alt="app-icon"
        src={xnft.metadata.properties.icon}
        width={100}
        height={100}
        layout="fixed"
      />

      <div className="flex flex-col items-start gap-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-semibold tracking-wide text-white">
            {xnft.metadata.name}
          </span>
          <BadgeCheckIcon className="text-[#45EB4D]" height={25} />
        </div>
        <div className="max-w-md text-lg font-medium text-[#99A4B4]">
          {xnft.metadata.description}
        </div>
        <AppPrimaryButton
          className="bg-[#4F46E5] text-white"
          disabled={!connected}
          installed={isInstalled}
          price={price}
          onClick={isInstalled ? handleOpenApp : handleInstall}
        />
      </div>
    </section>
  );
};

export default memo(AppBanner);
