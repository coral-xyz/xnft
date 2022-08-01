import { type FunctionComponent, memo } from 'react';
import type { SerializedXnftWithMetadata } from '../../utils/xnft';
import App from './App';

type PreviewProps = {
  className?: string;
  title: string;
  xnfts: SerializedXnftWithMetadata[];
};

const CategoryPreview: FunctionComponent<PreviewProps> = ({ className, title, xnfts }) => {
  return (
    <div className={`flex flex-col gap-7 ${className ?? ''}`}>
      <h2 className="text-2xl font-extrabold tracking-wide text-white">{title}</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {xnfts.map((xnft, idx) => (
          <App key={idx} publicKey={xnft.publicKey} metadata={xnft.metadata} />
        ))}
      </div>
    </div>
  );
};

export default memo(CategoryPreview);
