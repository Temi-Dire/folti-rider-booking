import type { VehicleId } from "@/lib/types";

const BODY: Record<VehicleId, string> = {
  basic: "M6 40 Q6 33 13 31 L26 28 L36 20 Q40 18 46 18 L66 18 Q72 18 76 22 L86 30 Q98 31 98 38 L98 44 L6 44 Z",
  priority: "M6 40 Q6 33 13 31 L26 28 L36 20 Q40 18 46 18 L66 18 Q72 18 76 22 L86 30 Q98 31 98 38 L98 44 L6 44 Z",
  premium: "M4 40 Q4 33 12 31 L28 27 L40 19 Q44 17 50 17 L68 17 Q74 17 79 21 L90 29 Q100 31 100 38 L100 44 L4 44 Z",
  xl: "M6 40 L8 22 Q9 16 16 16 L74 16 Q82 16 86 22 L96 32 Q100 34 100 40 L100 44 L6 44 Z",
};

const TINT: Record<VehicleId, string> = { basic: "#D4CCBE", priority: "#F2C230", premium: "#3A3942", xl: "#8FA7B3" };

const WINDOWS: Record<VehicleId, string> = {
  basic: "M40 22 q3-1 7-1 h8 v9 h-22 z M58 21 h8 q5 0 8 3 l6 6 h-22 z",
  priority: "M40 22 q3-1 7-1 h8 v9 h-22 z M58 21 h8 q5 0 8 3 l6 6 h-22 z",
  premium: "M43 21 q3-1 7-1 h8 v9 h-21 z M61 20 h8 q5 0 8 3 l7 6 h-23 z",
  xl: "M14 20 h20 v10 h-22 z M38 20 h20 v10 h-20 z M62 20 h12 q4 0 7 4 l4 6 h-23 z",
};

/** Side-profile illustration standing in for a vehicle photo. */
export function CarIllustration({ id, className = "" }: { id: VehicleId; className?: string }) {
  return (
    <svg viewBox="0 0 104 54" className={className} aria-hidden>
      <ellipse cx="52" cy="49" rx="46" ry="3" fill="#000" opacity=".3" />
      <path d={BODY[id]} fill={TINT[id]} />
      {id === "premium" && <path d="M10 34 H96" stroke="#5c5b66" strokeWidth="1" />}
      <path d={WINDOWS[id]} fill="#1d2329" opacity=".85" />
      <rect x="92" y="33" width="5" height="3" rx="1" fill="#fff6cc" />
      <circle cx="26" cy="44" r="7" fill="#111" />
      <circle cx="26" cy="44" r="3" fill="#8d8d8d" />
      <circle cx="78" cy="44" r="7" fill="#111" />
      <circle cx="78" cy="44" r="3" fill="#8d8d8d" />
    </svg>
  );
}
