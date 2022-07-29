import { DownloadIcon } from '@heroicons/react/solid';
import { FunctionComponent } from 'react';
import Image from 'next/image';

type FeaturedProps = {
  app: any;
  className?: string;
};

const Featured: FunctionComponent<FeaturedProps> = ({ app, className }) => {
  return (
    <div className={`${className ?? ''} flex items-center gap-14 rounded-2xl bg-[#27272A]`}>
      <Image
        className="rounded-l-2xl"
        alt="app-icon"
        src={app.metadata.properties.icon}
        height={400}
        width={400}
      />
      <div className="flex flex-col pr-14 tracking-wide">
        <h3 className="pb-2 font-medium text-[#99A4B4]">Featured</h3>
        <h1 className="pb-6 text-6xl font-bold text-white">{app.metadata.name}</h1>
        <h3 className="pb-8 font-medium text-white">{app.metadata.description}</h3>

        <div className="flex gap-4 text-sm font-medium">
          <button className="flex items-center gap-2.5 rounded-md bg-white py-2 px-4 text-[#374151]">
            Free <DownloadIcon height={16} />
          </button>
          <button className="rounded-md bg-[#52525B] py-2 px-4 text-[#D4D4D8]">Explore</button>
        </div>
      </div>
    </div>
  );
};

export default Featured;
