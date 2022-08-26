import Image from 'next/image';
import { memo, type FunctionComponent } from 'react';
import type { SerializedXnftWithMetadata } from '../../../utils/xnft';

interface OverviewTabProps {
  xnft: SerializedXnftWithMetadata;
}

const OverviewTab: FunctionComponent<OverviewTabProps> = ({ xnft }) => {
  return (
    <section className="w-full rounded-2xl bg-[#292C33]">
      <div className="flex justify-center p-10">
        <ul className="no-scrollbar flex list-none gap-5 overflow-x-auto">
          {xnft.metadata.properties.files.map((f, idx) => (
            <li key={f.uri}>
              <Image
                className="rounded-xl bg-transparent"
                alt={`screenshot-${idx}`}
                src={f.uri}
                height={479}
                width={300}
                layout="fixed"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default memo(OverviewTab);
