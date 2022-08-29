import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlinedIcon } from '@heroicons/react/24/outline';
import { type FunctionComponent, memo, useMemo, useState } from 'react';

interface SelectableRatingProps {
  id?: string;
  onSelect: (val: number) => void;
  size?: number;
  value: number;
}

const SelectableRating: FunctionComponent<SelectableRatingProps> = ({
  id,
  onSelect,
  size,
  value
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  /**
   * Memoized value for the pixel size of the star icons.
   */
  const starSize = useMemo(() => (size === undefined ? 16 : size), [size]);

  return (
    <div id={id} className="flex items-center">
      {[...new Array(5)].map((_, idx) =>
        value >= idx + 1 || hoverValue >= idx + 1 ? (
          <StarSolidIcon
            key={idx}
            className="pr-1"
            style={{ cursor: 'pointer' }}
            height={starSize}
            color="#FC9870"
            onClick={() => onSelect(idx + 1)}
            onMouseLeave={() => setHoverValue(0)}
          />
        ) : (
          <StarOutlinedIcon
            key={idx}
            className="pr-1"
            style={{ cursor: 'pointer' }}
            height={starSize}
            color="#FC9870"
            onMouseEnter={() => setHoverValue(idx + 1)}
          />
        )
      )}
      <span className="text-sm text-[#E5E7EB]">({value})</span>
    </div>
  );
};

export default memo(SelectableRating);
