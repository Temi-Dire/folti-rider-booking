import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { FLOW, type Step } from "@/state/bookingReducer";

interface Props {
  step: Step;
  title: string;
  subtitle?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
}

export function StepHeader({ step, title, subtitle, onBack, backLabel = "Back" }: Props) {
  const index = FLOW.indexOf(step);
  return (
    <div className="mb-4">
      {index >= 0 && (
        <div className="mb-4 flex gap-1" aria-label={`Step ${index + 1} of ${FLOW.length}`} role="img">
          {FLOW.map((s, i) => (
            <span key={s} className={`h-[3px] flex-1 rounded-full ${i <= index ? "bg-danfo" : "bg-line"}`} />
          ))}
        </div>
      )}
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={backLabel}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-chip text-ink hover:bg-white/15"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
        )}
        <div className="min-w-0">
          <h2 className="font-display text-[20px] leading-tight font-semibold">{title}</h2>
          {subtitle && <div className="mt-0.5 text-[13.5px] text-muted">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}
