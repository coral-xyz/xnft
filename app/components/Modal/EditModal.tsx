import {
  DocumentAddIcon,
  DocumentTextIcon,
  PencilAltIcon,
  PhotographIcon
} from '@heroicons/react/solid';
import { BN } from '@project-serum/anchor';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { type FunctionComponent, memo, useCallback, useState, useMemo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { HashLoader } from 'react-spinners';
import Image from 'next/image';
import { useXnftEdits, useXnftFocus, type XnftEdits } from '../../state/atoms/edit';
import { useProgram } from '../../state/atoms/program';
import {
  getBundlePath,
  getIconPath,
  revalidate,
  uploadFiles,
  uploadMetadata
} from '../../utils/api';
import {
  ALLOWED_IMAGE_TYPES,
  PLACEHOLDER_PUBKEY,
  PRICE_RX,
  S3_BUCKET_URL,
  XNFT_TAG_OPTIONS
} from '../../utils/constants';
import type { Metadata } from '../../utils/metadata';
import xNFT, { type UpdateParams, type XnftWithMetadata } from '../../utils/xnft';
import Input, { inputClasses } from '../Inputs/Input';
import InputWIthSuffix from '../Inputs/InputWIthSuffix';
import { transformBundleSize } from '../Publish/BundleUpload';
import Modal from './Base';
import { getImageDimensions } from '../Publish/Details';

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
  onClose: () => void;
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
          <PencilAltIcon height={16} />
          {focused?.metadata.name}
        </span>
      ),
    [focused, loading]
  );

  /**
   * Memoized function to handle the execution of the update xNFT
   * contract instruction with the provided modal inputs.
   */
  const handleUpdate = useCallback(async () => {
    if (!focused) return;

    setLoading(true);
    const changes = getChanges(focused, edits);

    try {
      // Call the `update_xnft` instruction if there are any account relevant changes
      if (Object.values(changes).some(x => x !== null)) {
        await xNFT.update(program, focused.publicKey, focused.account.masterMetadata, changes);
      }

      // Copy metadata into new mutable object
      let hasBundle = false;
      let hasIcon = false;
      const newMetadata: Metadata = {
        ...focused.metadata,
        name: edits.name,
        description: edits.description,
        properties: { ...focused.metadata.properties }
      };

      // Update bundle path if new one was provided
      if ((edits.bundle.size ?? 0) > 0) {
        hasBundle = true;
        newMetadata.properties.bundle = `${S3_BUCKET_URL}/${getBundlePath(
          focused.publicKey,
          edits.bundle.name
        )}`;
      }

      // Update icon path if new one was provided
      if ((edits.icon.size ?? 0) > 0) {
        hasIcon = true;
        newMetadata.image = `${S3_BUCKET_URL}/${getIconPath(focused.publicKey, edits.icon.name)}`;
      }

      // Upload new bundle and/or icon files if they were provided
      if (hasBundle || hasIcon) {
        await uploadFiles(
          focused.publicKey,
          hasBundle ? edits.bundle : undefined,
          hasIcon ? edits.icon : undefined
        );
      }

      // If the new and old metadata are no longer equal, upload the new metadata object
      if (JSON.stringify(newMetadata) !== JSON.stringify(focused.metadata)) {
        await uploadMetadata(focused.publicKey, newMetadata);
      }

      await revalidate(focused.publicKey);

      onClose();
    } catch (err) {
      console.error(`handleUpdate: ${err}`);
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
              placeholder="My xNFT Name"
              value={edits.name}
              onChange={e => setEdits(prev => ({ ...prev, name: e.target.value }))}
            />
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
                      <PhotographIcon className="mx-auto text-zinc-400" height={45} />
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
                      <DocumentAddIcon height={45} className="mx-auto text-[#9CA3AF]" />
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
            <button className="rounded-md bg-[#3F3F46] px-4 py-2 text-white" onClick={onClose}>
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
