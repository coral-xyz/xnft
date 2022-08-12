import { type FunctionComponent, memo } from 'react';
import Image from 'next/image';
import { CORAL_LINKS } from '../../utils/constants';

const Footer: FunctionComponent = () => {
  return (
    <footer className="flex justify-between px-5">
      <div className="flex flex-col justify-between">
        <p className="text-[#9CA3AF]">
          Built by{' '}
          <a className="text-white" href={CORAL_LINKS.home}>
            Coral
          </a>
        </p>
      </div>
      <div className="flex">
        <a
          href={CORAL_LINKS.twitter}
          className="mr-6 flex h-full w-5 flex-col justify-center"
          target="_blank"
          rel="noreferrer"
        >
          <Image
            alt="icon-twitter"
            src="/brands/twitter.png"
            height={20}
            width={20}
            layout="fixed"
          />
        </a>
        <a
          href={CORAL_LINKS.github}
          className="flex w-5 flex-col justify-center"
          target="_blank"
          rel="noreferrer"
        >
          <Image alt="icon-github" src="/brands/github.png" height={20} width={20} layout="fixed" />
        </a>
      </div>
    </footer>
  );
};

export default memo(Footer);
