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

export interface InputProps {
  className?: string;
  forbiddenChars?: string[];
  id?: string;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  maxLength?: number;
  name?: string;
  placeholder?: string;
  rows?: number;
  spellCheck?: boolean;
  type?: HTMLInputTypeAttribute;
  value: string | number;
}

const Input: FunctionComponent<InputProps> = ({
  className,
  forbiddenChars,
  id,
  onChange,
  maxLength,
  name,
  placeholder,
  rows,
  spellCheck,
  type,
  value
}) => {
  /**
   * Memoized function to block the prop provided characters from
   * being able to be inputted by the user.
   */
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
      maxLength={maxLength}
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
      maxLength={maxLength}
      placeholder={placeholder}
      value={value}
      onKeyDown={forbiddenChars ? blockForbiddenChars : undefined}
      onChange={onChange}
    />
  );
};

export default memo(Input);
