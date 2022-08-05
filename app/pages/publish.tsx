import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/solid';
import { PublicKey } from '@solana/web3.js';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import {
  type Dispatch,
  useMemo,
  useState,
  type SetStateAction,
  useCallback,
  useEffect
} from 'react';
import { useProgram } from '../state/hooks/solana';
import { uploadFiles, uploadMetadata } from '../utils/s3';
import xNFT from '../utils/xnft';

const BundleUpload = dynamic(() => import('../components/Publish/BundleUpload'));
const Details = dynamic(() => import('../components/Publish/Details'));
const Review = dynamic(() => import('../components/Publish/Review'));

export type StepComponentProps = {
  state: UploadState;
  setState: Dispatch<SetStateAction<UploadState>>;
  setNextEnabled: Dispatch<SetStateAction<boolean>>;
};

const steps = [
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

const defaultUploadState = {
  title: '',
  description: '',
  publisher: '',
  website: '',
  bundle: {} as File,
  royalties: '',
  price: '',
  supply: 'inf',
  icon: {} as File,
  screenshots: [] as File[]
};

export type UploadState = typeof defaultUploadState;

const PublishPage: NextPage = () => {
  const program = useProgram();
  const [currentStep, setCurrentStep] = useState(0);
  const [nextEnabled, setNextEnabled] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>(defaultUploadState);

  const activeStepComponent = useMemo(() => steps[currentStep], [currentStep]);

  useEffect(() => {
    if (!program.provider.publicKey?.equals(PublicKey.default)) {
      setUploadState(prev => ({ ...prev, publisher: program.provider.publicKey.toBase58() }));
    }
  }, [program]);

  const handleNextClicked = useCallback(async () => {
    if (currentStep === steps.length - 1) {
      try {
        const xnft = await xNFT.create(program, uploadState);
        await uploadFiles(xnft, uploadState);
        await uploadMetadata(xnft, uploadState);
      } catch (err) {
        console.error(`handleNextClicked: ${err}`);
      }
    } else {
      setCurrentStep(curr => curr + 1);
      setNextEnabled(false);
    }
  }, [uploadState, currentStep, program]);

  return (
    <div className="flex justify-center">
      <div className={currentStep === steps.length - 1 ? '' : 'inline-block'}>
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
              {steps.map((s, idx) => (
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
              {activeStepComponent.component({
                state: uploadState,
                setState: setUploadState,
                setNextEnabled
              })}
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
  );
};

export default PublishPage;
