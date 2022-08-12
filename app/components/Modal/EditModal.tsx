import { PencilAltIcon } from '@heroicons/react/solid';
import { BN } from '@project-serum/anchor';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { type FunctionComponent, memo, useMemo, useCallback, useState } from 'react';
import { HashLoader } from 'react-spinners';
import { useXnftEdits, useXnftFocus } from '../../state/atoms/edit';
import { useProgram } from '../../state/atoms/program';
import { PLACEHOLDER_PUBKEY, PRICE_RX, XNFT_TAG_OPTIONS } from '../../utils/constants';
import xNFT from '../../utils/xnft';
import Input, { inputClasses } from '../Inputs/Input';
import InputWIthSuffix from '../Inputs/InputWIthSuffix';
import Modal from './Base';

type EditModalProps = {
  onClose: () => void;
  open: boolean;
};

const EditModal: FunctionComponent<EditModalProps> = ({ onClose, open }) => {
  const program = useProgram();
  const [focused] = useXnftFocus();
  const [edits, setEdits] = useXnftEdits();
  const [loading, setLoading] = useState(false);

  /**
   * Memoized option elements for each valid xNFT tag enum variant.
   */
  const tagOptions = useMemo(
    () =>
      XNFT_TAG_OPTIONS.map((o, idx) => (
        <option key={idx} value={o}>
          {o}
        </option>
      )),
    []
  );

  const handleUpdate = useCallback(async () => {
    if (!focused) return;

    setLoading(true);

    try {
      await xNFT.update(program, focused.publicKey, focused.account.masterMetadata, {
        installVault: new PublicKey(edits.installVault),
        price: new BN(parseFloat(edits.price) * LAMPORTS_PER_SOL),
        tag: { [edits.tag.toLowerCase()]: {} } as never,
        uri: edits.uri
      });

      onClose();
    } catch (err) {
      console.error(`handleUpdate: ${err}`);
    } finally {
      setLoading(false);
    }
  }, [edits, focused, program, onClose]);

  return (
    <Modal
      title={
        loading ? undefined : (
          <span className="flex items-center gap-2 border-b border-[#393C43] pb-2">
            <PencilAltIcon height={16} />
            {focused?.metadata.name}
          </span>
        )
      }
      open={open}
      onClose={onClose}
    >
      {loading ? (
        <section className="flex justify-center">
          <HashLoader className="my-12" color="#F66C5E" size={56} />
        </section>
      ) : (
        <section className="flex flex-col gap-4">
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
