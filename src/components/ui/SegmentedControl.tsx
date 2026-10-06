"use client";

import type { LucideIcon } from "lucide-react";
import { useId } from "react";

export interface Segment<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  /** Colour of the selected pill. */
  tone?: "light" | "dusk";
}

interface Props<T extends string> {
  label: string;
  value: T;
  options: Segment<T>[];
  onChange: (value: T) => void;
}

/** Two or three mutually exclusive options, built on native radios for keyboard support. */
export function SegmentedControl<T extends string>({ label, value, options, onChange }: Props<T>) {
  const name = useId();
  return (
    <fieldset className="grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-chip p-1">
      <legend className="sr-only">{label}</legend>
      {options.map(({ value: v, label: l, icon: Icon, tone = "light" }) => {
        const on = v === value;
        const selected = tone === "dusk" ? "bg-dusk text-night" : "bg-ink text-night";
        return (
          <label
            key={v}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-full py-2.5 text-[14px] font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-danfo ${
              on ? selected : "text-muted hover:text-ink"
            }`}
          >
            <input type="radio" name={name} value={v} checked={on} onChange={() => onChange(v)} className="sr-only" />
            {Icon && <Icon className="size-4" aria-hidden />}
            {l}
          </label>
        );
      })}
    </fieldset>
  );
}
