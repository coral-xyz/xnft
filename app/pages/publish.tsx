import {
  ArrowRightIcon,
  CheckCircleIcon,
  EmojiSadIcon,
  SparklesIcon
} from '@heroicons/react/solid';
import { WalletSignTransactionError } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  type Dispatch,
  useMemo,
  useState,
  type SetStateAction,
  useCallback,
  useEffect
} from 'react';
import { HashLoader } from 'react-spinners';
import { useResetRecoilState } from 'recoil';
import { publishState as publishStateAtom } from '../state/atoms/publish';
import { useProgram } from '../state/hooks/solana';
import { usePublish } from '../state/hooks/xnfts';
import { uploadFiles, uploadMetadata } from '../utils/s3';
import xNFT from '../utils/xnft';

const BundleUpload = dynamic(() => import('../components/Publish/BundleUpload'));
const Details = dynamic(() => import('../components/Publish/Details'));
const Modal = dynamic(() => import('../components/Modal'));
const Review = dynamic(() => import('../components/Publish/Review'));

export type StepComponentProps = {
  setNextEnabled: Dispatch<SetStateAction<boolean>>;
};

const inputSteps = [
  {
    title: 'Upload files',
    component: (props: StepComponentProps) => <BundleUpload {...props} />,
    nextButtonText: 'Next',
    nextButtonIcon: <ArrowRightIcon className="inline-block w-4" />
  },
  {
    title: 'Details',
    component: (props: StepComponentProps) => <Details {...props} />,
    nextButtonText: 'Next',
    nextButtonIcon: <ArrowRightIcon className="inline-block w-4" />
  },
  {
    title: 'Review & mint',
    component: (props: StepComponentProps) => <Review {...props} />,
    nextButtonText: 'Upload & Mint',
    nextButtonIcon: <SparklesIcon className="inline-block w-4" />
  }
];

const uploadSteps = {
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

const PublishPage: NextPage = () => {
  const router = useRouter();
  const program = useProgram();
  const [publishState, setPublishState] = usePublish();
  const resetPublishState = useResetRecoilState(publishStateAtom);
  const [currentStep, setCurrentStep] = useState(0);
  const [nextEnabled, setNextEnabled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingStep, setProcessingStep] = useState<keyof typeof uploadSteps>('ix');
  const [processError, setProcessError] = useState<Error>(undefined);
  const [newPubkey, setNewPubkey] = useState(PublicKey.default);

  const activeStepComponent = useMemo(() => inputSteps[currentStep], [currentStep]);

  useEffect(() => {
    router.events.on('routeChangeStart', resetPublishState);
    return () => {
      router.events.off('routeChangeStart', resetPublishState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetPublishState]);

  useEffect(() => {
    if (!program.provider.publicKey?.equals(PublicKey.default)) {
      setPublishState(prev => ({ ...prev, publisher: program.provider.publicKey.toBase58() }));
    }
  }, [program, setPublishState]);

  const handleModalClose = useCallback(() => setModalOpen(false), []);

  const handleNextClicked = useCallback(async () => {
    if (currentStep === inputSteps.length - 1) {
      setModalOpen(true);

      try {
        const xnft = await xNFT.create(program, publishState);
        setNewPubkey(xnft);

        setProcessingStep('files');
        await uploadFiles(xnft, publishState);

        setProcessingStep('metadata');
        await uploadMetadata(xnft, publishState);

        setProcessingStep('success');
      } catch (err) {
        if (err instanceof WalletSignTransactionError) {
          setModalOpen(false);
        } else {
          setProcessingStep('error');
          setProcessError(err);
        }
        console.error(`handleNextClicked: ${err}`);
      }
    } else {
      setCurrentStep(curr => curr + 1);
      setNextEnabled(false);
    }
  }, [publishState, currentStep, program]);

  return (
    <>
      <div className="flex justify-center">
        <div className={currentStep === inputSteps.length - 1 ? '' : 'inline-block'}>
          <div className="flex flex-col items-center gap-5">
            <h1 className="text-center text-3xl font-bold leading-tight text-white">
              Publish your code as an executable xNFT
            </h1>
            <button
              type="button"
              className="mx-auto inline-flex w-32 cursor-no-drop
                items-center rounded-md border border-transparent
                bg-[#3F3F46] px-4 py-2 font-medium tracking-wide
                text-white shadow-sm"
            >
              Learn more
            </button>

            <div className="flex w-full flex-col gap-2 px-4">
              <div className="mt-12 mb-4 flex w-full justify-center gap-8">
                {inputSteps.map((s, idx) => (
                  <div
                    key={s.title}
                    className={`w-full text-center ${
                      currentStep >= idx ? 'text-[#F66C5E]' : 'text-white'
                    }`}
                  >
                    {s.title}
                  </div>
                ))}
              </div>

              <div className={`rounded-2xl bg-[#27272A]`}>
                {activeStepComponent.component({ setNextEnabled })}
              </div>

              <div className="flex justify-center">
                <button
                  className="mt-12 flex items-center rounded-md bg-[#4F46E5] px-4 py-2 text-white disabled:opacity-50"
                  onClick={handleNextClicked}
                  disabled={!nextEnabled}
                >
                  <span className="inline-block pr-2">{activeStepComponent.nextButtonText}</span>
                  {activeStepComponent.nextButtonIcon}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal open={modalOpen} onClose={handleModalClose}>
        <section className="flex flex-col items-center justify-center gap-6 py-8">
          {uploadSteps[processingStep].icon}
          <span className="font-medium tracking-wide">{uploadSteps[processingStep].text}</span>
          {processingStep === 'error' && (
            <>
              <span className="text-sm text-[#99A4B4]">{processError.message}</span>
              <button
                className="rounded-md bg-[#3F3F46] px-4 py-2 text-white"
                onClick={() => router.reload()}
              >
                Retry
              </button>
            </>
          )}
          {processingStep === 'success' && (
            <div className="flex gap-4">
              <Link href="/">
                <button className="rounded-md bg-[#3F3F46] px-4 py-2 text-white">Home</button>
              </Link>
              <Link href={`/app/${newPubkey.toBase58()}`}>
                <button className="rounded-md bg-[#4F46E5] px-4 py-2 text-white">View</button>
              </Link>
            </div>
          )}
        </section>
      </Modal>
    </>
  );
};

export default PublishPage;
