'use client';

type Props = {
  roundedFull?: boolean;
  [x: string]: any;
};

export default function Button({ roundedFull = true, className, ...props }: Props) {
  return (
    <button
      className={`inline-flex gap-2 items-center justify-between whitespace-nowrap rounded-md leading-5 p-2 transition dark:hover:bg-neutral-800 hover:bg-neutral-200 ${
        roundedFull ? 'rounded-lg' : ''
      } ${className}`}
      {...props}
    >
      {props.children}
    </button>
  );
}
