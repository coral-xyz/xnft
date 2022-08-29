import {
  DocumentPlusIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  PhotoIcon
} from '@heroicons/react/24/solid';
import { BN } from '@project-serum/anchor';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { type FunctionComponent, memo, useCallback, useState, useMemo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { HashLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useXnftEdits, useXnftFocus, type XnftEdits } from '../../state/atoms/edit';
import { useProgram } from '../../state/atoms/program';
import { revalidate } from '../../utils/api';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_NAME_LENGTH,
  PLACEHOLDER_PUBKEY,
  PRICE_RX,
  XNFT_TAG_OPTIONS
} from '../../utils/constants';
import type { Metadata } from '../../utils/metadata';
import { FileType, S3Uploader } from '../../utils/uploaders';
import xNFT, { type UpdateParams, type XnftWithMetadata } from '../../utils/xnft';
import Input, { inputClasses } from '../Inputs/Input';
import InputWIthSuffix from '../Inputs/InputWIthSuffix';
import { transformBundleSize } from '../Publish/BundleUpload';
import { getImageDimensions } from '../Publish/Details';
import Modal from './Base';

const NotifyExplorer = dynamic(() => import('../Notification/Explorer'));
const NotifyTransactionFailure = dynamic(() => import('../Notification/TransactionFailure'));

/**
 * Compares the argued xNFT updates against its current state and returns
 * the update instruction params that are necessary.
 * @param {XnftWithMetadata} xnft
 * @param {XnftEdits} updates
 * @returns {UpdateParams}
 */
function getChanges(xnft: XnftWithMetadata, updates: XnftEdits): UpdateParams {
  const newInstallVault = new PublicKey(updates.installVault);
  const newPrice = new BN(parseFloat(updates.price) * LAMPORTS_PER_SOL);

  return {
    installVault: newInstallVault.equals(xnft.account.installVault) ? null : newInstallVault,
    name: updates.name === xnft.account.name ? null : updates.name,
    price: newPrice.eq(xnft.account.installPrice) ? null : newPrice,
    tag: (updates.tag.toLowerCase() === xNFT.tagName(xnft.account.tag).toLowerCase()
      ? null
      : { [updates.tag.toLowerCase()]: {} }) as never,
    uri: updates.uri === xnft.metadataAccount.data.uri ? null : updates.uri
  };
}

/**
 * Array of components for all tag select field options.
 */
const tagOptions = XNFT_TAG_OPTIONS.map(o => (
  <option key={o} value={o}>
    {o}
  </option>
));

interface EditModalProps {
  onClose: (refresh?: boolean) => void;
  open: boolean;
}

const EditModal: FunctionComponent<EditModalProps> = ({ onClose, open }) => {
  const program = useProgram();
  const [focused] = useXnftFocus();
  const [edits, setEdits] = useXnftEdits();
  const bundleDrop = useDropzone({
    accept: { 'text/javascript': ['.js'] },
    maxFiles: 1
  });
  const iconDrop = useDropzone({ accept: ALLOWED_IMAGE_TYPES, maxFiles: 1 });
  const [loading, setLoading] = useState(false);
  const [iconDimensions, setIconDimensions] = useState('');

  /**
   * Component effect to set the edits state for the bundle
   * when a new accepted file is discovered in the dropzone input.
   */
  useEffect(() => {
    if (bundleDrop.acceptedFiles.length > 0) {
      // TODO: validate against existing bundle names?
      setEdits(prev => ({ ...prev, bundle: bundleDrop.acceptedFiles[0] }));
    }
  }, [bundleDrop.acceptedFiles, setEdits]);

  /**
   * Component effect to set the edits state for the icon
   * when a new accepted file is discovered in the dropzone input.
   */
  useEffect(() => {
    if (iconDrop.acceptedFiles.length > 0) {
      // TODO: validate against existing bundle names?
      setEdits(prev => ({ ...prev, icon: iconDrop.acceptedFiles[0] }));
    }
  }, [iconDrop.acceptedFiles, setEdits]);

  /**
   * Component effect to generate the app icon dimensions for the
   * subtext of the dropzone when an image is selected.
   */
  useEffect(() => {
    if (edits.icon.name) {
      getImageDimensions(edits.icon)
        .then(dims => setIconDimensions(dims.join('x')))
        .catch(console.error);
    }
  }, [edits.icon]);

  /**
   * Memoized value of the subtext for the bundle dropzone input
   * based on whether a source file has been selected or not.
   */
  const bundleSubtext = useMemo(
    () => (edits.bundle.size ? transformBundleSize(edits.bundle.size) : 'or drag and drop'),
    [edits.bundle]
  );

  /**
   * Memoized value of the ReactNode used for the title field of the modal.
   */
  const modalTitle = useMemo(
    () =>
      loading ? undefined : (
        <span className="flex items-center gap-2 border-b border-[#393C43] pb-2">
          <PencilSquareIcon height={16} />
          {focused?.metadata.name}
        </span>
      ),
    [focused, loading]
  );

  /**
   * Memoizd value for how many characters are remaining that can be
   * used in the inputted name for the new xNFT.
   */
  const nameCharsLeft = useMemo(() => MAX_NAME_LENGTH - edits.name.length, [edits.name]);

  /**
   * Memoized function to handle the execution of the update xNFT
   * contract instruction with the provided modal inputs.
   */
  const handleUpdate = useCallback(async () => {
    if (!focused) return;

    setLoading(true);
    const changes = getChanges(focused, edits);

    try {
      // Call the `update_xnft` instruction to set any account data changes
      // and to update the `updated_ts` timestamp field on the xNFT account
      const sig = await xNFT.update(
        program,
        focused.publicKey,
        focused.account.masterMetadata,
        changes
      );

      // Copy metadata into new mutable object
      const uploader = new S3Uploader(focused.publicKey);
      const newMetadata: Metadata = {
        ...focused.metadata,
        name: edits.name,
        description: edits.description,
        properties: { ...focused.metadata.properties }
      };

      // Upload and update bundle path if new one was provided
      if ((edits.bundle.size ?? 0) > 0) {
        newMetadata.properties.bundle = await uploader.uploadFile(edits.bundle, FileType.Bundle);
      }

      // Upload and update icon path if new one was provided
      if ((edits.icon.size ?? 0) > 0) {
        newMetadata.image = await uploader.uploadFile(edits.icon, FileType.Icon);
      }

      // If the new and old metadata are no longer equal, upload the new metadata object
      if (JSON.stringify(newMetadata) !== JSON.stringify(focused.metadata)) {
        await uploader.uploadMetadata(newMetadata);
      }

      await revalidate(focused.publicKey);

      onClose(true);

      toast(<NotifyExplorer signature={sig} title={`${focused.account.name} Updated!`} />, {
        type: 'success'
      });
    } catch (err) {
      console.error(`handleUpdate: ${err}`);
      toast(<NotifyTransactionFailure error={err} title="Update Failed!" />, { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [edits, focused, program, onClose]);

  return (
    <Modal title={modalTitle} open={open} onClose={onClose}>
      {loading ? (
        <section className="flex justify-center">
          <HashLoader className="my-12" color="#F66C5E" size={56} />
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
              Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              maxLength={MAX_NAME_LENGTH}
              placeholder="My xNFT Name"
              value={edits.name}
              onChange={e => setEdits(prev => ({ ...prev, name: e.target.value }))}
            />
            <span className="float-right pt-1 text-xs text-[#9CA3AF]">
              {nameCharsLeft} characters left
            </span>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="text-sm font-medium tracking-wide text-[#E5E7EB]"
            >
              Description
            </label>
            <Input
              id="description"
              name="description"
              rows={2}
              value={edits.description}
              onChange={e => setEdits(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {/* Install Price */}
          <div>
            <label htmlFor="price" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
              Price
            </label>
            <InputWIthSuffix
              id="price"
              name="price"
              type="number"
              className="pr-12 text-right"
              suffix="SOL"
              placeholder="0"
              value={edits.price}
              forbiddenChars={['+', '-', 'e']}
              onChange={e => {
                if (PRICE_RX.test(e.target.value)) {
                  setEdits(prev => ({ ...prev, price: e.target.value }));
                }
              }}
            />
          </div>

          {/* Install Vault Public Key */}
          <div>
            <label
              htmlFor="installVault"
              className="text-sm font-medium tracking-wide text-[#E5E7EB]"
            >
              Install Vault
            </label>
            <Input
              id="installVault"
              name="installVault"
              type="text"
              spellCheck={false}
              placeholder={PLACEHOLDER_PUBKEY}
              value={edits.installVault}
              onChange={e => setEdits(prev => ({ ...prev, installVault: e.target.value }))}
            />
          </div>

          {/* Tag Variant */}
          <div>
            <label htmlFor="tag" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
              Tag
            </label>
            <select
              id="tag"
              name="tag"
              className={inputClasses}
              value={edits.tag}
              onChange={e =>
                setEdits(prev => ({
                  ...prev,
                  tag: e.target.value as typeof XNFT_TAG_OPTIONS[number]
                }))
              }
            >
              {tagOptions}
            </select>
          </div>

          {/* Metadata URI */}
          <div>
            <label
              htmlFor="metadataUri"
              className="text-sm font-medium tracking-wide text-[#E5E7EB]"
            >
              Metadata URI
            </label>
            <Input
              id="metadataUri"
              name="metadataUri"
              type="url"
              placeholder="https://storage.method/my-metadata.json"
              value={edits.uri}
              onChange={e => setEdits(prev => ({ ...prev, uri: e.target.value }))}
            />
          </div>

          {/* New Icon */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="icon" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
                New Icon
              </label>
              <label
                {...iconDrop.getRootProps({
                  htmlFor: 'icon',
                  className: 'relative cursor-pointer'
                })}
              >
                <div className="mt-1 flex justify-center rounded-lg bg-[#18181B] py-4">
                  <div className="space-y-1 text-center">
                    {edits.icon.name ? (
                      <Image
                        className="rounded-md"
                        alt="new-app-icon"
                        src={URL.createObjectURL(edits.icon)}
                        height={40}
                        width={40}
                      />
                    ) : (
                      <PhotoIcon className="mx-auto text-zinc-400" height={45} />
                    )}
                    <div className="text-xs text-[#393C43]">
                      <span className="text-[#E5E7EB]">
                        {edits.icon.name ?? 'Upload a file or drag and drop'}
                      </span>
                      <input {...iconDrop.getInputProps({ className: 'sr-only hidden' })} />
                    </div>
                    <p className="text-xs text-[#9CA3AF]/50">
                      {iconDimensions !== '' ? iconDimensions : 'PNG, JPG, GIF up to 10MB'}
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* New Bundle */}
            <div>
              <label htmlFor="bundle" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
                New Bundle
              </label>
              <label
                {...bundleDrop.getRootProps({
                  htmlFor: 'bundle',
                  className: 'relative cursor-pointer'
                })}
              >
                <div className="mt-1 flex justify-center rounded-lg bg-[#18181B] py-4">
                  <div className="space-y-1 text-center">
                    {edits.bundle.name ? (
                      <DocumentTextIcon height={45} className="mx-auto text-[#9CA3AF]" />
                    ) : (
                      <DocumentPlusIcon height={45} className="mx-auto text-[#9CA3AF]" />
                    )}
                    <div className="text-xs text-[#393C43]">
                      <span className="text-[#E5E7EB]">
                        {edits.bundle.name ?? 'Upload an index.js file'}
                      </span>
                      <input {...bundleDrop.getInputProps({ className: 'sr-only hidden' })} />
                    </div>
                    <p className="text-xs text-[#9CA3AF]/50">{bundleSubtext}</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <button
              className="rounded-md bg-[#3F3F46] px-4 py-2 text-white"
              onClick={() => onClose(false)}
            >
              Close
            </button>
            <button className="rounded-md bg-[#4F46E5] px-4 py-2 text-white" onClick={handleUpdate}>
              Update
            </button>
          </div>
        </section>
      )}
    </Modal>
  );
};

export default memo(EditModal);
