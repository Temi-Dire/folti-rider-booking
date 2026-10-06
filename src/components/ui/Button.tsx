import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary: "bg-danfo text-on-danfo hover:bg-danfo-hover disabled:bg-danfo/40 disabled:text-on-danfo/60",
  ghost: "bg-transparent text-ink border border-line hover:bg-chip",
  danger: "bg-stop-soft text-stop hover:bg-stop/20",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  /** Small pill on the right, e.g. the price. */
  trailing?: ReactNode;
}

export function Button({ variant = "primary", loading, trailing, className = "", children, disabled, ...rest }: Props) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`flex h-13 w-full items-center justify-center gap-2 rounded-full px-5 text-[15.5px] font-semibold transition-colors disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...rest}
    >
      {loading && <LoaderCircle className="size-5 animate-spin" aria-hidden />}
      <span>{children}</span>
      {trailing && !loading && <span className="rounded-full bg-black/10 px-2.5 py-0.5 text-[13px]">{trailing}</span>}
    </button>
  );
}
