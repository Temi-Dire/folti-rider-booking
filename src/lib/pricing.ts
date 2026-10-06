import { haversineKm } from "./places";
import type { Place, TripEstimate, VehicleCategory } from "./types";

/** Roads are longer than a straight line; Lagos detours (bridges, one-ways) more than most. */
const ROAD_FACTOR = 1.35;

export function isPeakHour(date: Date): boolean {
  const day = date.getDay();
  const h = date.getHours();
  const weekday = day >= 1 && day <= 5;
  return weekday && ((h >= 7 && h < 10) || (h >= 17 && h < 20));
}

function isNight(date: Date): boolean {
  const h = date.getHours();
  return h >= 22 || h < 5;
}

/** Average driving speed in km/h, by time of day. */
function speedFor(date: Date): number {
  if (isPeakHour(date)) return 18;
  if (isNight(date)) return 40;
  return 30;
}

export function estimateTrip(from: Place, to: Place, at: Date): TripEstimate {
  const distanceKm = Math.max(1, haversineKm(from, to) * ROAD_FACTOR);
  const durationMin = Math.max(5, Math.round((distanceKm / speedFor(at)) * 60));
  return { distanceKm: Math.round(distanceKm * 10) / 10, durationMin };
}

export const PEAK_MULTIPLIER = 1.2;

const roundTo50 = (n: number) => Math.round(n / 50) * 50;

export function estimateFare(vehicle: VehicleCategory, trip: TripEstimate, at: Date): { fare: number; surge: boolean } {
  const { base, perKm, perMin, minimum } = vehicle.pricing;
  const surge = isPeakHour(at);
  const raw = (base + perKm * trip.distanceKm + perMin * trip.durationMin) * (surge ? PEAK_MULTIPLIER : 1);
  return { fare: roundTo50(Math.max(minimum, raw)), surge };
}
