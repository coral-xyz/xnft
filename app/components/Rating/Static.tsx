import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlinedIcon } from '@heroicons/react/24/outline';
import { type FunctionComponent, memo, useMemo } from 'react';

interface StaticRatingProps {
  rating: number;
  size?: number;
  total: number;
}

const StaticRating: FunctionComponent<StaticRatingProps> = ({ rating, size, total }) => {
  /**
   * Memoized value for the pixel size of the star icons.
   */
  const starSize = useMemo(() => (size === undefined ? 16 : size), [size]);

  return (
    <div className="flex items-center gap-1">
      {[...new Array(5)].map((_, idx) =>
        Math.round(rating) >= idx + 1 ? (
          <StarSolidIcon key={idx} height={starSize} color="#FC9870" />
        ) : (
          <StarOutlinedIcon key={idx} height={starSize} color="#FC9870" />
        )
      )}
      <span className="pl-2 text-xs font-medium text-white">{total} Reviews</span>
    </div>
  );
};

export default memo(StaticRating);
