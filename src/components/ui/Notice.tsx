import { CalendarClock, CircleAlert, Info } from "lucide-react";
import type { ReactNode } from "react";

const tones = {
  info: { box: "bg-chip text-ink", icon: Info, iconClass: "text-muted" },
  scheduled: { box: "bg-dusk-soft text-ink", icon: CalendarClock, iconClass: "text-dusk" },
  error: { box: "bg-stop-soft text-ink", icon: CircleAlert, iconClass: "text-stop" },
};

export function Notice({ tone = "info", children, role }: { tone?: keyof typeof tones; children: ReactNode; role?: "alert" | "status" }) {
  const t = tones[tone];
  const Icon = t.icon;
  return (
    <div role={role} className={`flex items-start gap-2.5 rounded-2xl px-3.5 py-3 text-[13.5px] leading-snug ${t.box}`}>
      <Icon className={`mt-px size-4 shrink-0 ${t.iconClass}`} aria-hidden />
      <div>{children}</div>
    </div>
  );
}
