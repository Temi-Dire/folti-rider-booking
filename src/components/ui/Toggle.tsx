interface Props {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ id, label, checked, onChange }: Props) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4 py-1 text-[14.5px]">
      <span>{label}</span>
      <span className="relative inline-flex">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="h-7 w-12 rounded-full bg-chip transition-colors peer-checked:bg-go peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-danfo" />
        <span className="absolute top-1 left-1 size-5 rounded-full bg-ink transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
