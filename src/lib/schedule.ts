/** Scheduling rules: at least 30 minutes ahead, at most 30 days ahead, 15-minute slots. */
export const MIN_LEAD_MIN = 30;
export const MAX_DAYS_AHEAD = 30;
export const SLOT_MIN = 15;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function earliestPickup(now: Date): Date {
  const t = new Date(now.getTime() + MIN_LEAD_MIN * 60_000);
  // Round up to the next slot.
  const rem = t.getMinutes() % SLOT_MIN;
  if (rem || t.getSeconds() || t.getMilliseconds()) t.setMinutes(t.getMinutes() + (SLOT_MIN - rem), 0, 0);
  return t;
}

export function latestPickup(now: Date): Date {
  const d = startOfDay(now);
  d.setDate(d.getDate() + MAX_DAYS_AHEAD);
  d.setHours(23, 45, 0, 0);
  return d;
}

/** Days that have at least one bookable slot. */
export function bookableDays(now: Date, count = MAX_DAYS_AHEAD + 1): Date[] {
  const first = startOfDay(earliestPickup(now));
  const last = latestPickup(now);
  const days: Date[] = [];
  for (let d = first; d <= last && days.length < count; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    days.push(d);
  }
  return days;
}

/** Bookable 15-minute slots on a given day. */
export function slotsForDay(day: Date, now: Date): Date[] {
  const min = earliestPickup(now);
  const max = latestPickup(now);
  const slots: Date[] = [];
  const t = startOfDay(day);
  const end = new Date(t);
  end.setDate(end.getDate() + 1);
  for (; t < end; t.setMinutes(t.getMinutes() + SLOT_MIN)) {
    if (t >= min && t <= max) slots.push(new Date(t));
  }
  return slots;
}

export type ScheduleError = "missing" | "too_soon" | "too_far";

export function checkScheduledTime(at: Date | null, now: Date): ScheduleError | null {
  if (!at || Number.isNaN(at.getTime())) return "missing";
  if (at.getTime() < now.getTime() + MIN_LEAD_MIN * 60_000 - 1000) return "too_soon";
  if (at > latestPickup(now)) return "too_far";
  return null;
}

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
