import { SearchIcon } from '@heroicons/react/solid';
import type { FunctionComponent } from 'react';

interface SearchProps {
  value: string;
  onChange: (val: string) => void;
}

const Search: FunctionComponent<SearchProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center justify-center">
      <label className="relative">
        <span className="absolute inset-y-0 right-0 flex items-center pr-4">
          <SearchIcon className="text-[#99A4B4]" height={16} />
        </span>
        <input
          className="w-64 rounded-lg border-[1px] border-[#393C43] bg-transparent py-3
            pl-4 pr-9 text-white outline-none placeholder:text-[#99A4B4] focus:ring-0"
          placeholder="Search"
          value={value}
          onChange={e => onChange(e.currentTarget.value)}
        />
      </label>
    </div>
  );
};

export default Search;
