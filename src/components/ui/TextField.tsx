import { CircleAlert } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, Ref } from "react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export function TextField({ id, label, error, hint, prefix, className = "", ...rest }: Props) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-muted">
        {label}
      </label>
      <div
        className={`flex h-12 items-center rounded-2xl border bg-field px-3.5 transition-colors focus-within:border-ink ${
          error ? "border-stop" : "border-line"
        }`}
      >
        {prefix && <span className="mr-3 border-r border-line pr-3 text-[15px] text-muted">{prefix}</span>}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="h-full w-full bg-transparent text-[15.5px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-muted/70"
          {...rest}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-[13px] text-stop">
          <CircleAlert className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
