import dynamic from 'next/dynamic';
import { type FunctionComponent, memo } from 'react';
import { type SerializedXnftWithMetadata } from '../../../utils/xnft';

const EmptyCommentsPlaceholder = dynamic(() => import('../../Placeholders/EmptyComments'));

interface ReviewsProps {
  xnft: SerializedXnftWithMetadata;
}

const Reviews: FunctionComponent<ReviewsProps> = _props => {
  // TODO: replace with state fetches once in place with samples to test with
  // const [comments, setComments] = useState<string[]>([]);

  return (
    <section className="w-full rounded-2xl bg-[#292C33]">
      <EmptyCommentsPlaceholder />
    </section>
  );
};

export default memo(Reviews);
