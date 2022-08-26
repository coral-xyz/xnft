import { StarIcon as StarSolidIcon } from '@heroicons/react/solid';
import { StarIcon as StarOutlinedIcon } from '@heroicons/react/outline';
import { type FunctionComponent, memo } from 'react';

interface RatingProps {
  rating: number;
  total: number;
}

const Rating: FunctionComponent<RatingProps> = ({ rating, total }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((_, idx) =>
        Math.round(rating) >= idx + 1 ? (
          <StarSolidIcon key={idx} height={16} color="#FC9870" />
        ) : (
          <StarOutlinedIcon key={idx} height={16} color="#FC9870" />
        )
      )}
      <span className="pl-2 text-xs font-medium text-white">{total} Reviews</span>
    </div>
  );
};

export default memo(Rating);
