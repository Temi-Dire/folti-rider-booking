import { formatTime } from "./format";
import type { Place, TimingMode, VehicleCategory } from "./types";

export interface Availability {
  available: boolean;
  reason?: string;
  etaMin?: number;
}

/** Small stable hash so the same place and hour always give the same ETA. */
function seed(text: string): number {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/**
 * Simulated supply. Deterministic on purpose so every state can be reproduced:
 * - Low-coverage pickups have no cars for ride-now (scheduling still works).
 * - Premium doesn't run between midnight and 5 AM.
 * - XL is fully booked for scheduled pickups between 6 and 9 AM.
 */
export function checkAvailability(
  vehicle: VehicleCategory,
  pickup: Place,
  timing: TimingMode,
  at: Date,
): Availability {
  const hour = at.getHours();

  if (vehicle.id === "premium" && hour < 5) {
    return { available: false, reason: "Premium runs 5 AM to midnight" };
  }

  if (timing === "scheduled") {
    if (vehicle.id === "xl" && hour >= 6 && hour < 9) {
      return { available: false, reason: `Fully booked for ${formatTime(at)}` };
    }
    return { available: true };
  }

  if (pickup.coverage === "low") {
    return { available: false, reason: `No ${vehicle.name} cars near ${pickup.name}` };
  }

  const base = 2 + (seed(`${pickup.id}:${hour}`) % 6);
  return { available: true, etaMin: Math.max(1, base + vehicle.etaOffset) };
}
