export type Coverage = "high" | "low";

export interface Place {
  id: string;
  name: string;
  /** Street or landmark shown under the name. */
  detail: string;
  lat: number;
  lng: number;
  /** How many drivers usually work this area. Low coverage = often no cars right now. */
  coverage: Coverage;
}

export type VehicleId = "basic" | "priority" | "premium" | "xl";

export interface VehicleCategory {
  id: VehicleId;
  name: string;
  seats: number;
  tagline: string;
  features: string[];
  pricing: { base: number; perKm: number; perMin: number; minimum: number };
  /** Extra minutes on top of the base pickup ETA. */
  etaOffset: number;
}

export type TimingMode = "now" | "scheduled";

export type RiderMode = "self" | "other";

export interface RiderDetails {
  mode: RiderMode;
  name: string;
  phone: string;
  note: string;
  notify: boolean;
}

export interface Booker {
  name: string;
  phone: string;
}

export interface TripEstimate {
  distanceKm: number;
  durationMin: number;
}

export interface VehicleOption {
  category: VehicleCategory;
  available: boolean;
  /** Why it can't be booked, shown on the card. */
  reason?: string;
  /** Minutes until pickup, for ride-now only. */
  etaMin?: number;
  fare: number;
  surge: boolean;
}

export interface Driver {
  name: string;
  rating: number;
  car: string;
  colour: string;
  plate: string;
  phone: string;
}

export type BookingStatus = "finding_driver" | "driver_assigned" | "scheduled";

export interface Booking {
  ref: string;
  createdAt: string;
  pickupId: string;
  destinationId: string;
  timing: TimingMode;
  /** ISO pickup time for scheduled rides. */
  scheduledAt: string | null;
  vehicleId: VehicleId;
  fare: number;
  trip: TripEstimate;
  booker: Booker;
  rider: RiderDetails;
  status: BookingStatus;
  driver: Driver | null;
  etaMin: number | null;
}
