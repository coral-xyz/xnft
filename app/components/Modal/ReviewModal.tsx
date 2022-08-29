import dynamic from 'next/dynamic';
import { type FunctionComponent, memo, useState, useCallback, type ReactNode } from 'react';
import Input from '../Inputs/Input';
import Modal from './Base';

const RatingSelection = dynamic(() => import('../Rating/Selectable'));

interface ReviewModalProps {
  onClose: () => void;
  open: boolean;
  title: ReactNode;
}

const ReviewModal: FunctionComponent<ReviewModalProps> = ({ onClose, open, title }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  /**
   * Memoized function for handling the submission and uploading
   * of the xNFT review rating and comment data.
   */
  const handleSubmitReview = useCallback(async () => {}, []);

  return (
    <Modal title={title} open={open} onClose={onClose}>
      <section className="flex flex-col gap-4 py-4">
        {/* Star Rating */}
        <div className="flex items-center gap-4">
          <label htmlFor="rating" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
            Rating:
          </label>
          <RatingSelection
            id="rating"
            size={24}
            onSelect={val => (val === rating ? setRating(0) : setRating(val))}
            value={rating}
          />
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
            Comment
          </label>
          <Input
            id="comment"
            name="comment"
            rows={5}
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button
            className="rounded-md bg-[#3F3F46] px-4 py-2 text-white"
            onClick={() => onClose()}
          >
            Close
          </button>
          <button
            className="rounded-md bg-[#4F46E5] px-4 py-2 text-white"
            onClick={handleSubmitReview}
          >
            Submit
          </button>
        </div>
      </section>
    </Modal>
  );
};

export default memo(ReviewModal);
