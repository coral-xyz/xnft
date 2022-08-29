import dynamic from 'next/dynamic';
import { type FunctionComponent, memo, useEffect, useCallback } from 'react';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { useXnftReviewsLoadable } from '../../../state/atoms/reviews';
import { type SerializedXnftWithMetadata } from '../../../utils/xnft';

const EmptyCommentsPlaceholder = dynamic(() => import('../../Placeholders/EmptyComments'));

interface ReviewsProps {
  xnft: SerializedXnftWithMetadata;
}

const Reviews: FunctionComponent<ReviewsProps> = ({ xnft }) => {
  const { reviews, loading, err } = useXnftReviewsLoadable(xnft.publicKey);

  useEffect(() => {
    if (err) {
      toast(`Failed to load reviews: ${err.message}`, { type: 'error' });
    }
  }, [err]);

  const handleCreateClick = useCallback(() => {}, []);

  return (
    <section className="w-full rounded-2xl bg-[#292C33]">
      {loading ? (
        <div className="flex justify-center py-12">
          <ClipLoader color="#F66C5E" size={64} />
        </div>
      ) : (
        <div className="flex flex-col items-center pb-12">
          <EmptyCommentsPlaceholder />
          <button
            className="-mt-8 rounded-md bg-[#4F46E5] px-3 py-2 text-sm
              font-medium tracking-wide text-white"
            onClick={handleCreateClick}
          >
            Create a Review
          </button>
        </div>
      )}
    </section>
  );
};

export default memo(Reviews);
