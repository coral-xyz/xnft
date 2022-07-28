import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { DownloadIcon } from '@heroicons/react/outline';
import { FunctionComponent, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { installXNFT } from '../../utils/xnft';

type AppProps = {
  iconUrl: string;
  name: string;
  description: string;
  publicKey?: string;
  publisher: PublicKey;
  installVault?: PublicKey;
};

const App: FunctionComponent<AppProps> = ({
  iconUrl,
  name,
  description,
  publicKey,
  publisher,
  installVault
}) => {
  const anchorWallet = useAnchorWallet();

  const appLink = publicKey ? `/app/${publicKey}` : '';

  async function install() {
    await installXNFT(anchorWallet, publisher, name, installVault);
  }

  return (
    <div className="flex w-full items-center justify-between rounded-md p-4">
      <Link className="w-10/12" href={appLink}>
        <div className="flex items-center gap-4">
          <Image
            alt="logo"
            src={iconUrl}
            blurDataURL="/brands/aurory.jpg" //TODO: fix me
            placeholder="blur"
            width={64}
            height={64}
          />

          <div>
            <div className="text-lg font-bold tracking-wide text-white">{name}</div>
            <div className="text-sm tracking-wide text-[#FAFAFA]">{description}</div>
          </div>
        </div>
      </Link>
      <button
        className="flex items-center gap-2.5 rounded bg-white py-2 px-3 text-xs font-medium tracking-wide text-[#374151] text-white"
        onClick={() => install()}
      >
        Free <DownloadIcon height={14} />
      </button>
    </div>
  );
};

export default memo(App);
