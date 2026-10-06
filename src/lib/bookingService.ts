/**
 * Fake backend. Everything here is simulated with small delays so the UI can show
 * loading, empty and failure states. Swap these functions for real API calls later.
 */
import { checkAvailability } from "./availability";
import { getDemoFlags } from "./demo";
import { getPlace } from "./places";
import { estimateFare, estimateTrip } from "./pricing";
import type { Booker, Booking, Driver, RiderDetails, TimingMode, TripEstimate, VehicleId, VehicleOption } from "./types";
import { normalizeNigerianPhone } from "./validation";
import { getVehicle, VEHICLES } from "./vehicles";

const wait = (ms: number) => {
  const factor = getDemoFlags().has("slow") ? 3 : 1;
  return new Promise((r) => setTimeout(r, ms * factor));
};

export interface QuoteRequest {
  pickupId: string;
  destinationId: string;
  timing: TimingMode;
  scheduledAt: string | null;
}

export interface Quote {
  trip: TripEstimate;
  options: VehicleOption[];
}

const pickupTime = (req: { timing: TimingMode; scheduledAt: string | null }) =>
  req.timing === "scheduled" && req.scheduledAt ? new Date(req.scheduledAt) : new Date();

/** Synchronous quote, used for the fetch below and for live fare summaries. */
export function quoteNow(req: QuoteRequest): Quote {
  const pickup = getPlace(req.pickupId);
  const destination = getPlace(req.destinationId);
  if (!pickup || !destination) throw new Error("Unknown place");
  const at = pickupTime(req);
  const trip = estimateTrip(pickup, destination, at);
  const forceNone = getDemoFlags().has("no-vehicles");

  const options = VEHICLES.map((category): VehicleOption => {
    const { fare, surge } = estimateFare(category, trip, at);
    const availability = forceNone
      ? { available: false, reason: `No ${category.name} cars near ${pickup.name}` }
      : checkAvailability(category, pickup, req.timing, at);
    return { category, fare, surge, ...availability };
  });
  return { trip, options };
}

export async function fetchQuote(req: QuoteRequest): Promise<Quote> {
  await wait(1100);
  return quoteNow(req);
}

export interface CreateBookingRequest extends QuoteRequest {
  vehicleId: VehicleId;
  booker: Booker;
  rider: RiderDetails;
}

export class BookingError extends Error {}

/** Unambiguous characters only (no 0/O, 1/I). */
const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function makeRef(): string {
  let s = "";
  for (let i = 0; i < 5; i++) s += REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)];
  return `FLT-${s}`;
}

let failNext = true;

export async function createBooking(req: CreateBookingRequest): Promise<Booking> {
  await wait(1400);
  // In demo mode the first attempt fails so the error + retry flow can be seen.
  if (getDemoFlags().has("booking-fails") && failNext) {
    failNext = false;
    throw new BookingError("We couldn't confirm your booking. Nothing was charged, so you can try again.");
  }
  failNext = true;

  const { trip, options } = quoteNow(req);
  const option = options.find((o) => o.category.id === req.vehicleId);
  if (!option || !option.available) {
    throw new BookingError(`${getVehicle(req.vehicleId)?.name ?? "That car"} just became unavailable. Pick another car.`);
  }

  const rider: RiderDetails =
    req.rider.mode === "other"
      ? { ...req.rider, name: req.rider.name.trim(), phone: normalizeNigerianPhone(req.rider.phone) ?? req.rider.phone, note: req.rider.note.trim() }
      : { mode: "self", name: "", phone: "", note: req.rider.note.trim(), notify: false };

  return {
    ref: makeRef(),
    createdAt: new Date().toISOString(),
    pickupId: req.pickupId,
    destinationId: req.destinationId,
    timing: req.timing,
    scheduledAt: req.timing === "scheduled" ? req.scheduledAt : null,
    vehicleId: req.vehicleId,
    fare: option.fare,
    trip,
    booker: req.booker,
    rider,
    status: req.timing === "scheduled" ? "scheduled" : "finding_driver",
    driver: null,
    etaMin: option.etaMin ?? null,
  };
}

const DRIVERS: Driver[] = [
  { name: "Chidi Okafor", rating: 4.9, car: "Toyota Corolla", colour: "Silver", plate: "LND 482 KJ", phone: "+2348031234567" },
  { name: "Aisha Bello", rating: 4.8, car: "Honda Accord", colour: "Black", plate: "EKY 219 AA", phone: "+2348092345678" },
  { name: "Tunde Adebayo", rating: 4.9, car: "Toyota Camry", colour: "Grey", plate: "KJA 731 XP", phone: "+2347013456789" },
  { name: "Emeka Nwosu", rating: 4.7, car: "Toyota Sienna", colour: "White", plate: "APP 904 LG", phone: "+2348124567890" },
];

/** Simulates the driver network accepting a ride-now booking. */
export async function assignDriver(booking: Booking): Promise<Booking> {
  await wait(2600);
  const driver = booking.vehicleId === "xl" ? DRIVERS[3] : DRIVERS[Math.floor(Math.random() * 3)];
  return { ...booking, status: "driver_assigned", driver };
}
