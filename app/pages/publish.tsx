// import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { ArrowRightIcon } from '@heroicons/react/solid';
import dynamic from 'next/dynamic';
import { useMemo, useReducer, useState } from 'react';
import { uploadInitialState, uploadReducer } from '../reducers/upload';

const BundleUpload = dynamic(() => import('../components/Publish/BundleUpload'));
const Details = dynamic(() => import('../components/Publish/Details'));
const Review = dynamic(() => import('../components/Publish/Review'));

const steps = [
  {
    title: 'Upload files',
    component: (props: any) => <BundleUpload {...props} />,
    width: 'max-w-[528px]',
    nextButtonText: 'Next'
  },
  {
    title: 'Details',
    component: (props: any) => <Details {...props} />,
    width: 'max-w-[528px]',
    nextButtonText: 'Next'
  },
  {
    title: 'Review & mint',
    component: (props: any) => <Review {...props} />,
    width: 'w-full',
    nextButtonText: 'Mint'
  }
];

export default function Publish() {
  // const { connected, publicKey } = useWallet();
  // const anchorWallet = useAnchorWallet();

  const [state, dispatch] = useReducer(uploadReducer, uploadInitialState);
  const [currentStep, setCurrentStep] = useState(0);

  const activeStepComponent = useMemo(() => steps[currentStep], [currentStep]);

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="flex flex-col gap-5">
        <h1 className="text-center text-3xl font-bold leading-tight text-zinc-50">
          Publish your app as an executable NFT
        </h1>
        <button
          type="button"
          className="mx-auto inline-flex w-32 cursor-no-drop
          items-center rounded-md border border-transparent
          bg-zinc-800 px-4 py-2 font-medium tracking-wide
          text-zinc-50 shadow-sm hover:bg-zinc-500"
        >
          Learn more
        </button>

        {/* Active form step */}
        <div className="flex flex-col gap-2 px-4">
          <div className="mt-12 mb-4 flex justify-center gap-8 text-zinc-50">
            {steps.map((s, idx) => (
              <div
                key={s.title}
                className={`w-28 text-center ${currentStep >= idx ? 'text-theme-primary' : ''}`}
              >
                {s.title}
              </div>
            ))}
          </div>

          <div className={`${activeStepComponent.width} rounded-2xl bg-[#292C33]`}>
            {activeStepComponent.component({ state, dispatch })}
          </div>

          <div className="flex justify-center">
            <button
              className="bg-theme-accent mt-12 w-24 rounded-md px-4 py-2 text-zinc-50 disabled:opacity-50"
              onClick={() => setCurrentStep(curr => curr + 1)}
            >
              <span className="inline-block pr-2">{activeStepComponent.nextButtonText}</span>
              <ArrowRightIcon className="inline-block w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}