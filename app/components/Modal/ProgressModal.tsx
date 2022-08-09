import { CheckCircleIcon, EmojiSadIcon } from '@heroicons/react/solid';
import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { type FunctionComponent, memo } from 'react';
import { HashLoader } from 'react-spinners';
import Modal from './Base';

export const UPLOAD_STEPS = {
  ix: {
    text: 'Processing instruction',
    icon: <HashLoader color="#F66C5E" size={30} />
  },
  files: {
    text: 'Uploading image files',
    icon: <HashLoader color="#F66C5E" size={30} />
  },
  metadata: {
    text: 'Uploading metadata file',
    icon: <HashLoader color="#F66C5E" size={30} />
  },
  success: {
    text: 'Publish complete!',
    icon: <CheckCircleIcon className="text-[#F66C5E]" height={50} />
  },
  error: {
    text: 'Something went wrong!',
    icon: <EmojiSadIcon className="text-[#F66C5E]" height={50} />
  }
};

type ProgressModalProps = {
  active: keyof typeof UPLOAD_STEPS;
  error?: Error;
  onClose: () => void;
  open: boolean;
  pubkey: PublicKey;
};

const ProgressModal: FunctionComponent<ProgressModalProps> = ({
  active,
  error,
  onClose,
  open,
  pubkey
}) => {
  const router = useRouter();

  return (
    <Modal open={open} onClose={onClose}>
      <section className="flex flex-col items-center justify-center gap-6 py-8">
        {UPLOAD_STEPS[active].icon}
        <span className="font-medium tracking-wide">{UPLOAD_STEPS[active].text}</span>
        {active === 'error' && (
          <>
            <span className="text-sm text-[#99A4B4]">{error.message}</span>
            <button
              className="rounded-md bg-[#3F3F46] px-4 py-2 text-white"
              onClick={() => router.reload()}
            >
              Retry
            </button>
          </>
        )}
        {active === 'success' && (
          <div className="flex gap-4">
            <Link href="/">
              <button className="rounded-md bg-[#3F3F46] px-4 py-2 text-white">Home</button>
            </Link>
            <Link href={`/app/${pubkey.toBase58()}`}>
              <button className="rounded-md bg-[#4F46E5] px-4 py-2 text-white">View</button>
            </Link>
          </div>
        )}
      </section>
    </Modal>
  );
};

export default memo(ProgressModal);
