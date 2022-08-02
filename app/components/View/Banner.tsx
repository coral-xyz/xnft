import { PublicKey } from '@solana/web3.js';
import { type FunctionComponent, memo } from 'react';
import Image from 'next/image';
import xNFT, { type XnftWithMetadata } from '../../utils/xnft';
import { useProgram } from '../../state/hooks/solana';

type AppBannerProps = {
  xnft: XnftWithMetadata;
};

const AppBanner: FunctionComponent<AppBannerProps> = ({ xnft }) => {
  const program = useProgram();

  async function handleInstall() {
    await xNFT.install(
      program,
      xnft.metadata.name,
      new PublicKey(xnft.account.publisher),
      new PublicKey(xnft.account.installVault)
    );
  }

  return (
    <>
      <div className="mx-auto mb-10 grid max-w-2xl grid-cols-4 gap-10">
        <Image
          className="col-span-1"
          src={xnft.metadata.properties.icon}
          alt=""
          width="200px"
          height="200px"
        />

        <div className="col-span-3 flex flex-col gap-3">
          <div className="text-2xl tracking-wide text-zinc-100">{xnft.metadata.name}</div>
          <div className="text-sm leading-5 text-zinc-300">{xnft.metadata.description}</div>
          <button
            type="button"
            className="inline-flex w-fit items-center rounded-md border border-transparent
            bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-indigo-50
            hover:bg-indigo-500"
            onClick={handleInstall}
          >
            Free
          </button>
        </div>
      </div>
    </>
  );
};

export default memo(AppBanner);
