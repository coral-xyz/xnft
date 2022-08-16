import { type FunctionComponent, memo, useMemo } from 'react';
import type { SerializedXnftWithMetadata } from '../../utils/xnft';
import App from '../App';

type PreviewProps = {
  className?: string;
  title: string;
  xnfts: SerializedXnftWithMetadata[];
};

const CategoryPreview: FunctionComponent<PreviewProps> = ({ className, title, xnfts }) => {
  /**
   * Memoized list of App components based on the list of xNFT
   * objects provided to the component via props.
   */
  const apps = useMemo(
    () =>
      xnfts.map(xnft => (
        <App key={xnft.publicKey} price={parseInt(xnft.account.installPrice, 16)} xnft={xnft} />
      )),
    [xnfts]
  );

  return (
    <div className={`flex flex-col gap-7 ${className ?? ''}`}>
      <h2 className="text-2xl font-extrabold tracking-wide text-white">{title}</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">{apps}</div>
    </div>
  );
};

export default memo(CategoryPreview);
