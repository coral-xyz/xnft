import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { memo, type ReactNode, type FunctionComponent } from 'react';
import { XNFT_KIND_OPTIONS, XNFT_L1_OPTIONS, XNFT_TAG_OPTIONS } from '../../../utils/constants';
import xNFT, { type SerializedXnftWithMetadata } from '../../../utils/xnft';

interface ItemProps {
  name: string;
  value: ReactNode;
}

const Item: FunctionComponent<ItemProps> = ({ name, value }) => {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-[#99A4B4]">{name}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
};

interface InformationTabProps {
  xnft: SerializedXnftWithMetadata;
}

const InformationTab: FunctionComponent<InformationTabProps> = ({ xnft }) => {
  return (
    <section className="mx-auto flex h-full max-w-3xl flex-col gap-4 rounded-2xl bg-[#292C33] p-4">
      <Item name="Authority" value={xnft.tokenData.owner} />
      <Item name="Publisher" value={xnft.account.publisher} />
      <Item name="L1" value={xNFT.enumVariantName(XNFT_L1_OPTIONS, xnft.account.l1)} />
      <Item name="Kind" value={xNFT.enumVariantName(XNFT_KIND_OPTIONS, xnft.account.kind)} />
      <Item name="Tag" value={xNFT.enumVariantName(XNFT_TAG_OPTIONS, xnft.account.tag)} />
      {xnft.metadata.external_url && (
        <Item
          name="Website"
          value={
            <Link
              className="flex cursor-pointer items-center gap-1 font-medium text-white hover:text-sky-500"
              href={xnft.metadata.external_url}
              target="_blank"
              rel="noreferrer"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              {xnft.metadata.external_url}
            </Link>
          }
        />
      )}
      <Item
        name="Supply"
        value={
          xnft.metadataAccount.collectionDetails ? (
            parseInt(xnft.metadataAccount.collectionDetails.size.toString(), 16).toLocaleString()
          ) : (
            <>&#8734;</>
          )
        }
      />
      <Item
        name="Last Updated"
        value={new Date(parseInt(xnft.account.updatedTs, 16) * 1000).toUTCString()}
      />

      {xnft.metadataAccount.data.uri && (
        <Item
          name="Metadata"
          value={
            <Link
              className="flex cursor-pointer items-center gap-1 font-medium text-white hover:text-sky-500"
              href={xnft.metadataAccount.data.uri.replace(
                'ipfs://',
                'https://nftstorage.link/ipfs/'
              )}
              target="_blank"
              rel="noreferrer"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              Open
            </Link>
          }
        />
      )}
    </section>
  );
};

export default memo(InformationTab);
