import { SearchIcon } from '@heroicons/react/solid';
import type { FunctionComponent } from 'react';

type SearchProps = {
  value: string;
  onChange: (val: string) => void;
};

const Search: FunctionComponent<SearchProps> = ({ value, onChange }) => {
  return (
    <div className="hidden items-center justify-center lg:flex">
      <label className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-2">
          <SearchIcon className="text-theme-font-gray" height={16} />
        </span>
        <input
          className="bg-theme-background-light placeholder:text-theme-font-gray w-80 rounded-lg py-2 pr-3 pl-8 font-normal focus:ring-0"
          placeholder="Search"
          value={value}
          onChange={e => onChange(e.currentTarget.value)}
        />
      </label>
    </div>
  );
};

export default Search;
