import { checkScheduledTime, MAX_DAYS_AHEAD, MIN_LEAD_MIN } from "./schedule";
import type { RiderDetails, TimingMode } from "./types";

export interface TripInput {
  pickupId: string | null;
  destinationId: string | null;
  timing: TimingMode;
  scheduledAt: string | null;
}

export type TripErrors = Partial<Record<"pickup" | "destination" | "schedule", string>>;
export type RiderErrors = Partial<Record<"name" | "phone", string>>;

export function validateTrip(input: TripInput, now: Date): TripErrors {
  const errors: TripErrors = {};
  if (!input.pickupId) errors.pickup = "Choose a pickup point";
  if (!input.destinationId) errors.destination = "Choose a destination";
  else if (input.pickupId === input.destinationId) errors.destination = "Destination must be different from pickup";

  if (input.timing === "scheduled") {
    const problem = checkScheduledTime(input.scheduledAt ? new Date(input.scheduledAt) : null, now);
    if (problem === "missing") errors.schedule = "Choose a pickup day and time";
    if (problem === "too_soon") errors.schedule = `Pick a time at least ${MIN_LEAD_MIN} minutes from now`;
    if (problem === "too_far") errors.schedule = `You can schedule up to ${MAX_DAYS_AHEAD} days ahead`;
  }
  return errors;
}

/**
 * Nigerian mobile numbers. Accepts 0803 456 7812, 803 456 7812, 234…, +234…
 * Returns E.164 (+2348034567812) or null.
 */
export function normalizeNigerianPhone(input: string): string | null {
  let digits = input.replace(/[^\d]/g, "");
  if (digits.startsWith("234")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return /^[789][01]\d{8}$/.test(digits) ? `+234${digits}` : null;
}

export function validateRider(rider: RiderDetails): RiderErrors {
  if (rider.mode === "self") return {};
  const errors: RiderErrors = {};
  const name = rider.name.trim();
  if (!name) errors.name = "Enter the rider's name";
  else if (name.length < 2 || !/[a-zA-Z]/.test(name)) errors.name = "Enter a real name so the driver can find them";

  if (!rider.phone.trim()) errors.phone = "Enter the rider's phone number";
  else if (!normalizeNigerianPhone(rider.phone)) errors.phone = "Enter a Nigerian mobile number, like 0803 456 7812";
  return errors;
}

export const hasErrors = (e: object) => Object.keys(e).length > 0;
