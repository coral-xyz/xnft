import {
  type KeyboardEvent,
  type HTMLInputTypeAttribute,
  type FunctionComponent,
  type ChangeEventHandler,
  memo,
  useCallback
} from 'react';

export const inputClasses = `w-full rounded-md border-[#18181B] bg-[#18181B] text-sm text-[#E5E7EB]
  placeholder:text-[#393C43] focus:border-[#F66C5E] focus:ring-0 mt-1`;

export type InputProps = {
  className?: string;
  forbiddenChars?: string[];
  id?: string;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  name?: string;
  placeholder?: string;
  rows?: number;
  spellCheck?: boolean;
  type?: HTMLInputTypeAttribute;
  value: string | number;
};

const Input: FunctionComponent<InputProps> = ({
  className,
  forbiddenChars,
  id,
  onChange,
  name,
  placeholder,
  rows,
  spellCheck,
  type,
  value
}) => {
  const blockForbiddenChars = useCallback(
    (e: KeyboardEvent) => {
      if (forbiddenChars.includes(e.key)) {
        e.preventDefault();
      }
    },
    [forbiddenChars]
  );

  return rows ? (
    <textarea
      className={`${inputClasses} resize-none ${className ?? ''}`}
      id={id}
      name={name}
      spellCheck={spellCheck}
      rows={rows}
      value={value}
      onKeyDown={forbiddenChars ? blockForbiddenChars : undefined}
      onChange={onChange}
    />
  ) : (
    <input
      className={`${inputClasses} ${className ?? ''}`}
      id={id}
      name={name}
      spellCheck={spellCheck}
      type={type}
      placeholder={placeholder}
      value={value}
      onKeyDown={forbiddenChars ? blockForbiddenChars : undefined}
      onChange={onChange}
    />
  );
};

export default memo(Input);