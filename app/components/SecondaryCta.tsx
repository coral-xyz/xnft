import Link from 'next/link';
import { type FunctionComponent, memo } from 'react';

const SecondaryCta: FunctionComponent = () => {
  return (
    <div>
      <h2 className="text-center text-3xl font-extrabold font-extrabold tracking-tight sm:text-4xl">
        <span className="block text-[#F9FAFB]">Developer?</span>
        <span className="block text-[#14B8A6]">Publish your code as an executable xNFT</span>
      </h2>
      <div className="mt-8 flex justify-center">
        <div className="inline-flex rounded-md shadow">
          <Link
            href="/publish"
            className="inline-flex items-center justify-center rounded-md border
              border-transparent bg-[#14B8A6] px-5 py-3 text-base font-medium text-white"
          >
            Get started
          </Link>
        </div>
        <div className="ml-3 inline-flex">
          <Link
            href="https://docs.xnft.gg"
            target="_blank"
            className="inline-flex items-center justify-center rounded-md border
              border-transparent bg-white px-5 py-3 text-base font-medium text-[#14B8A6]"
          >
            Docs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default memo(SecondaryCta);
