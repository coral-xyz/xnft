import { type FunctionComponent, memo, type ReactNode } from 'react';
import Input, { type InputProps } from './Input';

type InputWithSuffixProps = InputProps & {
  suffix: ReactNode;
};

const InputWithSuffix: FunctionComponent<InputWithSuffixProps> = ({ suffix, ...rest }) => {
  return (
    <label className="relative block">
      <span className="absolute inset-y-0 right-0 mt-1 flex items-center pr-2 text-sm text-[#393C43]">
        {suffix}
      </span>
      <Input {...rest} />
    </label>
  );
};

export default memo(InputWithSuffix);
