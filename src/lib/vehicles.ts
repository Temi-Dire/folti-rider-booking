import type { VehicleCategory, VehicleId } from "./types";

export const VEHICLES: VehicleCategory[] = [
  {
    id: "basic",
    name: "Basic",
    seats: 4,
    tagline: "Affordable everyday rides",
    features: ["Lowest price", "AC"],
    pricing: { base: 500, perKm: 250, perMin: 20, minimum: 1500 },
    etaOffset: 0,
  },
  {
    id: "priority",
    name: "Priority",
    seats: 4,
    tagline: "Faster pickup, top-rated drivers",
    features: ["Faster pickup", "4.8+ drivers", "AC"],
    pricing: { base: 700, perKm: 300, perMin: 25, minimum: 2000 },
    etaOffset: -1,
  },
  {
    id: "premium",
    name: "Premium",
    seats: 4,
    tagline: "Newer cars, extra comfort",
    features: ["2021+ cars", "Extra legroom", "Phone charger"],
    pricing: { base: 1200, perKm: 480, perMin: 35, minimum: 3500 },
    etaOffset: 3,
  },
  {
    id: "xl",
    name: "XL",
    seats: 6,
    tagline: "Room for groups and luggage",
    features: ["6 seats", "Big boot", "AC"],
    pricing: { base: 1000, perKm: 400, perMin: 30, minimum: 3000 },
    etaOffset: 5,
  },
];

export function getVehicle(id: VehicleId | null | undefined): VehicleCategory | undefined {
  return id ? VEHICLES.find((v) => v.id === id) : undefined;
}
