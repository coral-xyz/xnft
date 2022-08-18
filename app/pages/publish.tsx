import { ArrowLeftIcon, ArrowRightIcon, SparklesIcon } from '@heroicons/react/solid';
import { WalletSignTransactionError } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
  type Dispatch,
  useMemo,
  useState,
  type SetStateAction,
  useCallback,
  useEffect
} from 'react';
import { useResetRecoilState } from 'recoil';
import { UPLOAD_STEPS } from '../components/Modal/ProgressModal';
import { publishState as publishStateAtom } from '../state/atoms/publish';
import { useProgram } from '../state/atoms/program';
import { usePublish } from '../state/atoms/publish';
import { revalidate, uploadFiles, uploadMetadata } from '../utils/api';
import xNFT from '../utils/xnft';
import { generateMetadata } from '../utils/metadata';

const BundleUpload = dynamic(() => import('../components/Publish/BundleUpload'));
const Details = dynamic(() => import('../components/Publish/Details'));
const DisconnectedPlaceholder = dynamic(() => import('../components/Placeholders/Disconnected'));
const ProgressModal = dynamic(() => import('../components/Modal/ProgressModal'));
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

const PublishPage: NextPage = () => {
  const router = useRouter();
  const { connected } = useWallet();
  const program = useProgram();
  const [publishState, setPublishState] = usePublish();
  const resetPublishState = useResetRecoilState(publishStateAtom);
  const [inputStep, setInputStep] = useState(0);
  const [nextEnabled, setNextEnabled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingStep, setProcessingStep] = useState<keyof typeof UPLOAD_STEPS>('ix');
  const [processingError, setProcessingError] = useState<Error>(undefined);
  const [newPubkey, setNewPubkey] = useState(PublicKey.default);

  /**
   * Memoized value for the active component designated by
   * the active step numerical indicator.
   */
  const activeStepComponent = useMemo(() => inputSteps[inputStep], [inputStep]);

  /**
   * Handles the resettings of the recoil state for the xNFT
   * publishing input flow when the route changes.
   */
  useEffect(() => {
    router.events.on('hashChangeComplete', resetPublishState);
    return () => {
      router.events.off('hashChangeComplete', resetPublishState);
    };
  }, [router, resetPublishState]);

  /**
   * Sets the `publisher` field of the xNFT publish input state
   * to the connected wallet's public key if detected.
   */
  useEffect(() => {
    if (!program.provider.publicKey?.equals(PublicKey.default)) {
      setPublishState(prev => ({ ...prev, publisher: program.provider.publicKey.toBase58() }));
    }
  }, [program, setPublishState]);

  /**
   * Memoized function to hide the progress display modal.
   */
  const handleModalClose = useCallback(() => setModalOpen(false), []);

  /**
   * Memoized function to handle the publishing of the xNFT
   * metadata files and requesting the approval and the confirmation
   * of the instruction from the contract to create it on-chain.
   */
  const handlePublish = useCallback(async () => {
    try {
      setModalOpen(true);

      const [_, xnft] = await xNFT.create(program, publishState);
      setNewPubkey(xnft);

      setProcessingStep('files');
      await uploadFiles(xnft, publishState.bundle, publishState.icon, publishState.screenshots);

      setProcessingStep('metadata');
      await uploadMetadata(xnft, generateMetadata(xnft, publishState));
      await revalidate(xnft);

      setProcessingStep('success');
    } catch (err) {
      if (err instanceof WalletSignTransactionError) {
        setModalOpen(false);
        return;
      }

      setProcessingStep('error');
      setProcessingError(err);
      console.error(`handleNextClicked: ${err}`);
    }
  }, [program, publishState]);

  /**
   * Memoized function to handle the clicking event of the "Next"
   * button at the bottom of each input panel.
   */
  const handleNextClicked = useCallback(async () => {
    if (inputStep !== inputSteps.length - 1) {
      setInputStep(curr => curr + 1);
      setNextEnabled(x => !x);
      return;
    }

    handlePublish();
  }, [inputStep, handlePublish]);

  /**
   * Memoized function to handle clicking the "Back" button in the flow.
   */
  const handleBackClicked = useCallback(() => {
    if (inputStep > 0) {
      setInputStep(curr => curr - 1);
    }
  }, [inputStep]);

  /**
   * Memoized list of components representing the dynamic headers
   * for the panels in the publishing flow.
   */
  const stepHeaders = useMemo(
    () =>
      inputSteps.map((s, idx) => (
        <div
          key={s.title}
          className={`w-full text-center ${inputStep >= idx ? 'text-[#F66C5E]' : 'text-white'}`}
        >
          {s.title}
        </div>
      )),
    [inputStep]
  );

  return connected ? (
    <>
      <div className="flex justify-center">
        <div className={inputStep === inputSteps.length - 1 ? '' : 'inline-block'}>
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
              <div className="mt-12 mb-4 flex w-full justify-center gap-8">{stepHeaders}</div>

              <div className="rounded-2xl bg-[#27272A]">
                {activeStepComponent.component({ setNextEnabled })}
              </div>

              <div className="flex justify-center gap-6 pt-12">
                {inputStep > 0 && (
                  <button
                    className="flex items-center rounded-md bg-[#4F46E5] px-4 py-2 text-white"
                    onClick={handleBackClicked}
                  >
                    <ArrowLeftIcon className="inline-block w-4" />
                    <span className="inline-block pl-2">Back</span>
                  </button>
                )}
                <button
                  className="flex items-center rounded-md bg-[#4F46E5] px-4 py-2 text-white disabled:opacity-50"
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
      <ProgressModal
        active={processingStep}
        error={processingError}
        open={modalOpen}
        onClose={handleModalClose}
        pubkey={newPubkey}
      />
    </>
  ) : (
    <DisconnectedPlaceholder />
  );
};

export default PublishPage;
