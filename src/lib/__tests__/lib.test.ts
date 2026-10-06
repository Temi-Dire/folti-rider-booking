import { describe, expect, it } from "vitest";
import { checkAvailability } from "../availability";
import { getPlace } from "../places";
import { estimateFare, estimateTrip, isPeakHour } from "../pricing";
import { checkScheduledTime, earliestPickup, slotsForDay } from "../schedule";
import { normalizeNigerianPhone, validateRider, validateTrip } from "../validation";
import { getVehicle } from "../vehicles";

const yaba = getPlace("yaba")!;
const lekki = getPlace("lekki-phase-1")!;
const epe = getPlace("epe")!;
const basic = getVehicle("basic")!;
const premium = getVehicle("premium")!;
const xl = getVehicle("xl")!;

// Tuesday 6 Oct 2026, 2:10 PM local time
const now = new Date(2026, 9, 6, 14, 10);

describe("pricing", () => {
  it("prices nicer cars higher for the same trip", () => {
    const trip = estimateTrip(yaba, lekki, now);
    expect(estimateFare(premium, trip, now).fare).toBeGreaterThan(estimateFare(basic, trip, now).fare);
  });

  it("adds a busy-hours surcharge on weekday rush hour only", () => {
    const rush = new Date(2026, 9, 6, 8, 0);
    const sunday = new Date(2026, 9, 11, 8, 0);
    expect(isPeakHour(rush)).toBe(true);
    expect(isPeakHour(sunday)).toBe(false);
    const trip = estimateTrip(yaba, lekki, rush);
    expect(estimateFare(basic, trip, rush).surge).toBe(true);
  });

  it("rounds fares to the nearest ₦50 and respects the minimum", () => {
    const trip = { distanceKm: 1, durationMin: 5 };
    const { fare } = estimateFare(basic, trip, now);
    expect(fare % 50).toBe(0);
    expect(fare).toBeGreaterThanOrEqual(basic.pricing.minimum);
  });
});

describe("availability", () => {
  it("has no ride-now cars in low-coverage areas", () => {
    expect(checkAvailability(basic, epe, "now", now).available).toBe(false);
  });

  it("still allows scheduling from low-coverage areas", () => {
    expect(checkAvailability(basic, epe, "scheduled", new Date(2026, 9, 9, 12, 0)).available).toBe(true);
  });

  it("marks XL fully booked for early-morning scheduled pickups", () => {
    const r = checkAvailability(xl, yaba, "scheduled", new Date(2026, 9, 9, 6, 0));
    expect(r.available).toBe(false);
    expect(r.reason).toMatch(/Fully booked/);
  });

  it("gives an ETA for ride-now cars", () => {
    expect(checkAvailability(basic, yaba, "now", now).etaMin).toBeGreaterThan(0);
  });
});

describe("scheduling", () => {
  it("never offers a slot sooner than 30 minutes from now", () => {
    const first = slotsForDay(now, now)[0];
    expect(first.getTime()).toBeGreaterThanOrEqual(now.getTime() + 30 * 60_000);
    expect(first.getMinutes() % 15).toBe(0);
  });

  it("rejects past, too-soon and too-far times", () => {
    expect(checkScheduledTime(new Date(2026, 9, 6, 9, 0), now)).toBe("too_soon");
    expect(checkScheduledTime(new Date(2026, 9, 6, 14, 20), now)).toBe("too_soon");
    expect(checkScheduledTime(new Date(2026, 11, 25, 9, 0), now)).toBe("too_far");
    expect(checkScheduledTime(earliestPickup(now), now)).toBeNull();
    expect(checkScheduledTime(null, now)).toBe("missing");
  });
});

describe("validation", () => {
  it("requires two different places", () => {
    expect(validateTrip({ pickupId: null, destinationId: null, timing: "now", scheduledAt: null }, now)).toHaveProperty("pickup");
    expect(validateTrip({ pickupId: "yaba", destinationId: "yaba", timing: "now", scheduledAt: null }, now)).toHaveProperty("destination");
    expect(validateTrip({ pickupId: "yaba", destinationId: "ikeja", timing: "now", scheduledAt: null }, now)).toEqual({});
  });

  it("requires a valid time for scheduled rides", () => {
    expect(validateTrip({ pickupId: "yaba", destinationId: "ikeja", timing: "scheduled", scheduledAt: null }, now)).toHaveProperty("schedule");
  });

  it.each([
    ["0803 456 7812", "+2348034567812"],
    ["8034567812", "+2348034567812"],
    ["+234 803 456 7812", "+2348034567812"],
    ["234-901-234-5678", "+2349012345678"],
  ])("normalises %s", (input, expected) => {
    expect(normalizeNigerianPhone(input)).toBe(expected);
  });

  it.each(["0803 456 78", "0603 456 7812", "12345", ""])("rejects %s", (input) => {
    expect(normalizeNigerianPhone(input)).toBeNull();
  });

  it("only checks rider details when booking for someone else", () => {
    expect(validateRider({ mode: "self", name: "", phone: "", note: "", notify: false })).toEqual({});
    const errs = validateRider({ mode: "other", name: "", phone: "123", note: "", notify: true });
    expect(errs).toHaveProperty("name");
    expect(errs).toHaveProperty("phone");
  });
});
