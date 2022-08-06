import { Dialog, Transition } from '@headlessui/react';
import { Fragment, type FunctionComponent, memo, type ReactNode, useMemo } from 'react';

type ModalProps = {
  children: ReactNode;
  title?: ReactNode;
  open: boolean;
  onClose: () => void;
  width?: number;
};

const Modal: FunctionComponent<ModalProps> = props => {
  const w = useMemo(
    () => (props.width !== undefined ? `[${props.width}px]` : 'full'),
    [props.width]
  );

  return (
    <Transition appear show={props.open} as={Fragment}>
      <Dialog as="div" className="relative z-10" open={props.open} onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        <section className="fixed inset-0">
          <div className="flex min-h-full items-center justify-center text-white">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`max-w-md w-${w} rounded-2xl bg-[#27272A] p-6 shadow-xl`}>
                {props.title && (
                  <Dialog.Title
                    as="h3"
                    className="mb-6 text-xl font-semibold tracking-wide text-white"
                  >
                    {props.title}
                  </Dialog.Title>
                )}
                {props.children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </section>
      </Dialog>
    </Transition>
  );
};

export default memo(Modal);
