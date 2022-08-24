import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { type FunctionComponent, memo, type ReactNode, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useSetRecoilState } from 'recoil';
import { useXnftFocus } from '../../state/atoms/edit';
import { useProgram } from '../../state/atoms/program';
import { forceInstalledRefresh, forceOwnedRefresh } from '../../state/atoms/xnft';
import type { InstalledXnftWithMetadata, XnftWithMetadata } from '../../utils/xnft';
import xNFT from '../../utils/xnft';

const NotifyExplorer = dynamic(() => import('../Notification/explorer'));

interface MetaButtonProps {
  children?: ReactNode;
  className?: string;
  onClick: () => void;
}

const MetaButton: FunctionComponent<MetaButtonProps> = ({ children, className, onClick }) => {
  return (
    <button
      className={`rounded bg-[#52525B] py-2 px-3 text-xs font-medium tracking-wide text-white ${
        className ?? ''
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

type ProfileProps = {
  link: string;
  onOpen: () => void;
  type: 'installed' | 'owned';
  xnft: XnftWithMetadata | InstalledXnftWithMetadata;
};

const Profile: FunctionComponent<ProfileProps> = ({ link, onOpen, type, xnft }) => {
  const router = useRouter();
  const program = useProgram();
  const [_, setFocused] = useXnftFocus();
  const refreshInstalled = useSetRecoilState(forceInstalledRefresh);
  const refreshOwned = useSetRecoilState(forceOwnedRefresh);

  /**
   * Memoized value for the xNFT account data based on the structure
   * of the object provided to the component.
   */
  const account = useMemo(() => ('xnft' in xnft ? xnft.xnft : xnft), [xnft]);

  /**
   * Memoized functions for the `onClick` handlers of the
   * different `MetaButton` components on the app panel.
   */
  const handleClickDetails = useCallback(() => router.push(link), [link, router]);
  const handleClickEdit = useCallback(() => setFocused(account), [account, setFocused]);

  const handleClickSuspensionToggle = useCallback(async () => {
    try {
      const sig = await xNFT.setSuspended(program, account.publicKey, !account.account.suspended);
      refreshOwned(prev => prev + 1);

      toast(
        <NotifyExplorer
          signature={sig}
          title={`${account.account.name} ${
            account.account.suspended ? 'Unsuspended' : 'Suspended'
          }!`}
        />,
        { type: 'success' }
      );
    } catch (err) {
      console.error(`onSetSuspend: ${err}`);
    }
  }, [program, account, refreshOwned]);

  const handleClickUninstall = useCallback(async () => {
    try {
      const sig = await xNFT.delete(program, (xnft as InstalledXnftWithMetadata).install.publicKey);
      refreshInstalled(prev => prev + 1);

      toast(<NotifyExplorer signature={sig} title={`${account.account.name} Uninstalled!`} />, {
        type: 'success'
      });
    } catch (err) {
      console.error(`onUninstall: ${err}`);
    }
  }, [account, program, xnft, refreshInstalled]);

  return (
    <div
      className={`flex items-center gap-4 rounded-lg bg-[#27272A] p-4 shadow-lg transition-all
        hover:-translate-y-1 hover:bg-[#27272A]/40 ${
          account.account.suspended && type === 'owned' ? 'border border-red-500' : ''
        }`}
    >
      <Link href={link} className="self-start">
        <Image
          className="rounded-lg"
          alt="app-icon"
          src={account.metadata.image}
          height={64}
          width={64}
          layout="fixed"
        />
      </Link>
      <div className="min-w-0 pt-2">
        <div className="text-lg font-bold tracking-wide text-white">{account.account.name}</div>
        <div className="truncate text-sm tracking-wide text-[#FAFAFA]">
          {account.metadata.description}
        </div>
        <div className="mt-4 flex gap-3">
          {type === 'installed' && <MetaButton onClick={onOpen}>Open</MetaButton>}
          <MetaButton onClick={handleClickDetails}>Details</MetaButton>
          {type === 'owned' && (
            <>
              <MetaButton onClick={handleClickEdit}>Edit</MetaButton>
              <MetaButton onClick={handleClickSuspensionToggle}>
                {account.account.suspended ? 'Unsuspend' : 'Suspend'}
              </MetaButton>
            </>
          )}
          {type === 'installed' && (
            <MetaButton onClick={handleClickUninstall}>Uninstall</MetaButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(Profile);
