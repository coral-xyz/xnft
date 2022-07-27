import { type FunctionComponent, memo } from 'react';

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

type AppPlaceholderProps = {
  blur: string;
  animate: boolean;
};

const AppPlaceholder: FunctionComponent<AppPlaceholderProps> = ({ blur, animate }) => {
  function generatePlaceholder() {
    const component = [];
    for (let i = 0; i < 16; i++) {
      component.push(
        <div
          key={i}
          className={classNames('flex space-x-4 pb-4', `${blur}`, animate && 'animate-pulse')}
        >
          <div className="h-10 w-10 rounded-full bg-slate-200"></div>
          <div className="flex-1 space-y-3 py-2">
            <div className="h-2 w-40 rounded bg-slate-200"></div>
            <div className="space-y-2">
              <div className="h-2 rounded bg-slate-400"></div>
            </div>
          </div>
        </div>
      );
    }

    return component;
  }

  return (
    <div
      role="list"
      className="mt-3 flex flex-row flex-wrap justify-between gap-x-4 gap-y-2 md:justify-start"
    >
      {generatePlaceholder()}
    </div>
  );
};

export default memo(AppPlaceholder);
