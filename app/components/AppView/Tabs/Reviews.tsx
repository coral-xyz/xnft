import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { type FunctionComponent, memo, useEffect, useCallback, useState, useMemo } from 'react';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { useXnftReviewsLoadable } from '../../../state/atoms/reviews';
import { type SerializedXnftWithMetadata } from '../../../utils/xnft';

const EmptyCommentsPlaceholder = dynamic(() => import('../../Placeholders/EmptyComments'));
const Rating = dynamic(() => import('../../Rating/Static'));
const ReviewModal = dynamic(() => import('../../Modal/ReviewModal'));

interface ReviewsProps {
  xnft: SerializedXnftWithMetadata;
}

const Reviews: FunctionComponent<ReviewsProps> = ({ xnft }) => {
  const { reviews, loading, err } = useXnftReviewsLoadable(xnft.publicKey);
  const [modalOpen, setModalOpen] = useState(false);

  /**
   * Component effect to spawn a new toast notification if there was
   * an error while loading the review data for the xNFT.
   */
  useEffect(() => {
    if (err) {
      toast(`Failed to load reviews: ${err.message}`, { type: 'error' });
    }
  }, [err]);

  /**
   * Memoized value of the React node that is the modal title.
   */
  const modalTitle = useMemo(
    () => (
      <span className="flex items-center gap-2 border-b border-[#393C43] pb-2">
        <ChatBubbleBottomCenterTextIcon height={24} />
        Create Review
      </span>
    ),
    []
  );

  const handleClickOpen = useCallback(() => setModalOpen(true), []);
  const handleModalClose = useCallback(() => setModalOpen(false), []);

  return (
    <>
      <section className="w-full rounded-2xl bg-[#292C33]">
        {loading ? (
          <div className="flex justify-center py-12">
            <ClipLoader color="#F66C5E" size={64} />
          </div>
        ) : reviews.length > 0 ? (
          <div>
            <button
              className="mx-auto block w-full rounded-t-md bg-[#4F46E5] px-3 py-1 text-xs
                font-medium tracking-wide text-white"
              onClick={handleClickOpen}
            >
              Create a Review
            </button>
            <div className="flex flex-col gap-2 px-8 py-6">
              {reviews.map(r => (
                <div key={r.publicKey.toBase58()} className="flex justify-between">
                  <span className="flex items-center gap-6">
                    <span className="text-sm text-[#E5E7EB]">{r.account.author.toBase58()}</span>
                    <Link
                      className="rounded bg-[#4F46E5] px-3 py-1 text-xs font-medium tracking-wide text-white"
                      href={r.account.uri}
                      target="_blank"
                    >
                      View
                    </Link>
                  </span>
                  <Rating rating={r.account.rating} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center pb-12">
            <EmptyCommentsPlaceholder />
            <button
              className="-mt-8 rounded-md bg-[#4F46E5] px-3 py-2 text-sm
              font-medium tracking-wide text-white"
              onClick={handleClickOpen}
            >
              Create a Review
            </button>
          </div>
        )}
      </section>
      <ReviewModal
        title={modalTitle}
        open={modalOpen}
        onClose={handleModalClose}
        xnft={xnft.publicKey}
      />
    </>
  );
};

export default memo(Reviews);
