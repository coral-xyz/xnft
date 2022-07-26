import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { installXNFT } from '../../utils/xnft';

function App({ iconUrl, name, description, publicKey, publisher, installVault, mode }: AppPros) {
  const anchorWallet = useAnchorWallet();

  const appLink = publicKey ? `/app/${publicKey}` : '';

  async function install() {
    await installXNFT(anchorWallet, publisher, name, installVault);
  }

  return (
    <div className="flex w-full items-center justify-between rounded-md px-5 py-2">
      <Link className="w-10/12" href={appLink}>
        <div className="flex  gap-3">
          <div className="h-10 w-10">
            <Image
              alt="logo"
              src={iconUrl}
              blurDataURL="/brands/aurory.jpg" //TODO: fix me
              placeholder="blur"
              quality={50}
              width="100px"
              height="100px"
            />
          </div>

          <div>
            <div className="font-medium tracking-wide text-zinc-50">{name}</div>
            <div className="text-xs tracking-wide text-zinc-300">{description}</div>
          </div>
        </div>
      </Link>
      {mode === 'installed' && (
        <button className="h-8 rounded bg-red-500 px-1 text-xs font-medium uppercase tracking-wide text-red-50 hover:bg-red-600">
          Uninstall
        </button>
      )}
      {mode === 'owned' && (
        <button
          className="h-8 cursor-not-allowed rounded bg-zinc-500 px-2 text-xs font-medium uppercase tracking-wide text-zinc-50"
          disabled
        >
          Edit
        </button>
      )}
      {publisher && !mode && (
        <button
          className="h-8 w-10 rounded bg-indigo-600 text-xs font-medium uppercase tracking-wide text-zinc-50"
          onClick={() => install()}
        >
          Free
        </button>
      )}
    </div>
  );
}

interface AppPros {
  iconUrl: string;
  name: string;
  description: string;
  publicKey?: string;
  publisher?: PublicKey;
  installVault?: PublicKey;
  mode?: string;
}

export default memo(App);
