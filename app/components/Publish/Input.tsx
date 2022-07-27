import type { FunctionComponent, HTMLInputTypeAttribute } from 'react';

type InputProps = {
  id: string;
  type?: HTMLInputTypeAttribute;
  name: string;
  className?: string;
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
  required?: boolean;
  area?: boolean;
  rows?: number;
};

const Input: FunctionComponent<InputProps> = props => {
  const classes = `focus:border-theme-primary border-theme-background bg-theme-background
    text-theme-font-gray-light w-full rounded-md text-sm focus:ring-0 ${
      props.className ? props.className : ''
    }`;

  return props.area ? (
    <textarea
      id={props.id}
      name={props.name}
      className={classes}
      rows={props.rows ?? 2}
      placeholder={props.placeholder}
      value={props.value}
      onChange={e => props.onChange(e.currentTarget.value)}
      required={props.required ?? false}
    />
  ) : (
    <input
      id={props.id}
      type={props.type ?? 'text'}
      name={props.name}
      className={classes}
      placeholder={props.placeholder}
      value={props.value}
      onChange={e => props.onChange(e.currentTarget.value)}
      required={props.required ?? false}
    />
  );
};

export default Input;
