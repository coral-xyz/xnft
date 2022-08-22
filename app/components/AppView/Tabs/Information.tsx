import { ExternalLinkIcon } from '@heroicons/react/solid';
import Link from 'next/link';
import { memo, type ReactNode, type FunctionComponent } from 'react';
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
    <section className="mx-auto mt-5 flex h-full max-w-3xl flex-col gap-4 rounded-xl bg-[#292C33] p-4">
      <Item name="Authority" value={xnft.account.authority} />
      <Item name="Tag" value={xNFT.tagName(xnft.account.tag)} />
      <Item name="Kind" value={xNFT.kindName(xnft.account.kind)} />
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
              <ExternalLinkIcon className="h-4 w-4" />
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
              href={xnft.metadataAccount.data.uri}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLinkIcon className="h-4 w-4" />
              Open
            </Link>
          }
        />
      )}
    </section>
  );
};

export default memo(InformationTab);
