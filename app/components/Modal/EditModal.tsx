import { type FunctionComponent, memo } from 'react';
import Modal from './Base';

type EditModalProps = {
  onClose: () => void;
  open: boolean;
};

const EditModal: FunctionComponent<EditModalProps> = ({ onClose, open }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <section></section>
    </Modal>
  );
};

export default memo(EditModal);
