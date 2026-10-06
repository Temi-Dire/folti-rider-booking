import { CalendarClock, Zap } from "lucide-react";

/** Tells the rider at a glance whether this is a ride now or a future booking. */
export function TimingBadge({ scheduledLabel }: { scheduledLabel: string | null }) {
  if (scheduledLabel) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-dusk-soft px-2.5 py-1 text-[12.5px] font-semibold text-dusk">
        <CalendarClock className="size-3.5" aria-hidden />
        Scheduled, {scheduledLabel}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-go-soft px-2.5 py-1 text-[12.5px] font-semibold text-go">
      <Zap className="size-3.5" aria-hidden />
      Ride now
    </span>
  );
}
