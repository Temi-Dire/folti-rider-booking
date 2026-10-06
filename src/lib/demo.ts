/**
 * URL switches so reviewers can force non-happy-path states:
 *   ?demo=no-vehicles   every car unavailable
 *   ?demo=booking-fails creating a booking fails (retry works)
 *   ?demo=slow          3x longer loading
 * Combine with commas: ?demo=slow,booking-fails
 */
export type DemoFlag = "no-vehicles" | "booking-fails" | "slow";

export function getDemoFlags(): Set<DemoFlag> {
  if (typeof window === "undefined") return new Set();
  const raw = new URLSearchParams(window.location.search).get("demo") ?? "";
  return new Set(raw.split(",").map((s) => s.trim()).filter(Boolean) as DemoFlag[]);
}
