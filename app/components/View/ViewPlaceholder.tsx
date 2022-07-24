import React, { memo } from 'react';

function ViewPlaceholder() {
  return (
    <div className="animate-pulse">
      <div className="mx-auto border-b-2 border-zinc-600">
        <div className="mx-auto mb-5 grid max-w-2xl grid-cols-4 gap-10">
          <div className="mr-4 h-36 w-36 rounded-full bg-slate-500" />

          <div className="col-span-3 flex flex-col gap-3">
            <div className="h-6 w-60 rounded bg-slate-500" />
            <div className="h-6 w-60 rounded bg-slate-500" />
            <div className="h-8 w-14 rounded bg-slate-500" />
          </div>
          <div className="mt-8 flex min-w-fit gap-2">
            <div className="h-5 w-36 rounded bg-slate-500" />
            <div className="h-5 w-36 rounded bg-slate-500" />
          </div>
        </div>
      </div>
      <div className="mx-auto mt-5 h-96 max-w-2xl rounded-xl bg-slate-600" />
    </div>
  );
}

export default memo(ViewPlaceholder);
