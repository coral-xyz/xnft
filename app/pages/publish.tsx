import { ArrowRightIcon } from '@heroicons/react/solid';
import dynamic from 'next/dynamic';
import { type Dispatch, useMemo, useReducer, useState, type SetStateAction } from 'react';
import {
  type UploadDispatchAction,
  uploadInitialState,
  uploadReducer,
  type UploadState
} from '../state/reducers/upload';

const BundleUpload = dynamic(() => import('../components/Publish/BundleUpload'));
const Details = dynamic(() => import('../components/Publish/Details'));
const Review = dynamic(() => import('../components/Publish/Review'));

export type StepComponentProps = {
  state: UploadState;
  dispatch: Dispatch<UploadDispatchAction<any>>;
  setNextEnabled: Dispatch<SetStateAction<boolean>>;
};

const steps = [
  {
    title: 'Upload files',
    component: (props: StepComponentProps) => <BundleUpload {...props} />,
    width: 'max-w-[528px]',
    nextButtonText: 'Next'
  },
  {
    title: 'Details',
    component: (props: StepComponentProps) => <Details {...props} />,
    width: 'max-w-[528px]',
    nextButtonText: 'Next'
  },
  {
    title: 'Review & mint',
    component: (props: StepComponentProps) => <Review {...props} />,
    width: 'w-full',
    nextButtonText: 'Mint'
  }
];

export default function Publish() {
  const [state, dispatch] = useReducer(uploadReducer, uploadInitialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [nextEnabled, setNextEnabled] = useState(false);

  const activeStepComponent = useMemo(() => steps[currentStep], [currentStep]);

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="flex flex-col gap-5">
        <h1 className="text-theme-font text-center text-3xl font-bold leading-tight">
          Publish your app as an executable NFT
        </h1>
        <button
          type="button"
          className="text-theme-font bg-theme-background-light mx-auto inline-flex
          w-32 cursor-no-drop items-center rounded-md
          border border-transparent px-4 py-2 font-medium
          tracking-wide shadow-sm"
        >
          Learn more
        </button>

        {/* Active form step */}
        <div className="flex flex-col gap-2 px-4">
          <div className="text-theme-font mt-12 mb-4 flex justify-center gap-8">
            {steps.map((s, idx) => (
              <div
                key={s.title}
                className={`w-28 text-center ${currentStep >= idx ? 'text-theme-primary' : ''}`}
              >
                {s.title}
              </div>
            ))}
          </div>

          <div className={`${activeStepComponent.width} bg-theme-background-light rounded-2xl`}>
            {activeStepComponent.component({ state, dispatch, setNextEnabled })}
          </div>

          <div className="flex justify-center">
            <button
              className="bg-theme-accent text-theme-font mt-12 w-24 rounded-md px-4 py-2 disabled:opacity-50"
              onClick={() => {
                setCurrentStep(curr => curr + 1);
                setNextEnabled(false);
              }}
              disabled={!nextEnabled}
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
