import { PublicKey } from '@solana/web3.js';
import { type FunctionComponent, memo, useMemo } from 'react';
import { BadgeCheckIcon } from '@heroicons/react/solid';
import { BN } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import Image from 'next/image';
import xNFT, { type SerializedXnftWithMetadata } from '../../utils/xnft';
import { useProgram } from '../../state/atoms/program';

type AppBannerProps = {
  xnft: SerializedXnftWithMetadata;
};

const AppBanner: FunctionComponent<AppBannerProps> = ({ xnft }) => {
  const program = useProgram();
  const { connected } = useWallet();

  const price = useMemo(() => new BN(xnft.account.installPrice), [xnft.account.installPrice]);

  async function handleInstall() {
    await xNFT.install(
      program,
      xnft.metadata.name,
      new PublicKey(xnft.account.publisher),
      new PublicKey(xnft.account.installVault)
    );
  }

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
        <button
          className="rounded-md bg-[#4F46E5] px-4 py-2.5 font-medium tracking-wide text-white"
          onClick={handleInstall}
          disabled={!connected}
        >
          {price.isZero() ? 'Free' : `${price.toNumber()} SOL`}
        </button>
      </div>
    </section>
  );
};

export default memo(AppBanner);
