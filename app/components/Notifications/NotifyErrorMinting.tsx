import { Fragment, memo, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/outline';
import { XIcon } from '@heroicons/react/solid';

function NotifyErrorMinting({ show, setShow }: NotifyMintedProps) {
  useEffect(() => {
    if (show) {
      let timer1 = setTimeout(() => setShow(false), 5000);

      return () => {
        clearTimeout(timer1);
      };
    }
  }, [show, setShow]);

  return (
    <>
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 
        sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="pointer-events-auto w-full max-w-sm overflow-hidden
            rounded-lg bg-zinc-600 shadow-lg ring-1 ring-black ring-opacity-5"
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-zinc-100">Error minting xNFT</p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-zinc-600 text-zinc-400
                      hover:text-zinc-300 focus:outline-none focus:ring-2
                      focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => {
                        setShow(false);
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
}

interface NotifyMintedProps {
  setShow: any;
  show: boolean;
}

export default memo(NotifyErrorMinting);
