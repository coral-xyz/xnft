import { PencilAltIcon } from '@heroicons/react/solid';
import { type FunctionComponent, memo, useMemo } from 'react';
import { useXnftEdits, useXnftFocus } from '../../state/atoms/edit';
import { priceRx } from '../../state/atoms/publish';
import { XNFT_TAG_OPTIONS } from '../../utils/xnft';
import Input, { inputClasses } from '../Inputs/Input';
import InputWIthSuffix from '../Inputs/InputWIthSuffix';
import Modal from './Base';

type EditModalProps = {
  onClose: () => void;
  open: boolean;
};

const EditModal: FunctionComponent<EditModalProps> = ({ onClose, open }) => {
  const [xnft] = useXnftFocus();
  const [edits, setEdits] = useXnftEdits();

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

  return (
    <Modal
      title={
        <span className="flex items-center gap-2 border-b border-[#393C43] pb-2">
          <PencilAltIcon height={16} />
          {xnft?.metadata.name}
        </span>
      }
      open={open}
      onClose={onClose}
    >
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
              if (priceRx.test(e.target.value)) {
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
            placeholder="3f1Ypov9Lv1Lmr4arkjY2fTMHcj4dRWP7BcpiDW6PTe3"
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
          <label htmlFor="metadataUri" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
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
      </section>
    </Modal>
  );
};

export default memo(EditModal);
