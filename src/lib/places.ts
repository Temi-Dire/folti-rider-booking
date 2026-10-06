import type { Place } from "./types";

/** Mock Lagos locations. Coordinates are approximate area centres. */
export const PLACES: Place[] = [
  { id: "yaba", name: "Yaba", detail: "Herbert Macaulay Way", lat: 6.5095, lng: 3.3711, coverage: "high" },
  { id: "lekki-phase-1", name: "Lekki Phase 1", detail: "Admiralty Way", lat: 6.4478, lng: 3.4723, coverage: "high" },
  { id: "victoria-island", name: "Victoria Island", detail: "Ahmadu Bello Way", lat: 6.4281, lng: 3.4219, coverage: "high" },
  { id: "ikoyi", name: "Ikoyi", detail: "Awolowo Road", lat: 6.4549, lng: 3.4346, coverage: "high" },
  { id: "ikeja", name: "Ikeja", detail: "Allen Avenue", lat: 6.6018, lng: 3.3515, coverage: "high" },
  { id: "airport", name: "Lagos Airport", detail: "Murtala Muhammed, Ikeja", lat: 6.5774, lng: 3.3212, coverage: "high" },
  { id: "surulere", name: "Surulere", detail: "Adeniran Ogunsanya Street", lat: 6.5009, lng: 3.358, coverage: "high" },
  { id: "lagos-island", name: "Lagos Island", detail: "Marina", lat: 6.4513, lng: 3.3896, coverage: "high" },
  { id: "maryland", name: "Maryland", detail: "Ikorodu Road", lat: 6.5711, lng: 3.3676, coverage: "high" },
  { id: "gbagada", name: "Gbagada", detail: "Gbagada Expressway", lat: 6.5531, lng: 3.3899, coverage: "high" },
  { id: "oshodi", name: "Oshodi", detail: "Oshodi Interchange", lat: 6.555, lng: 3.3436, coverage: "high" },
  { id: "ajah", name: "Ajah", detail: "Lekki-Epe Expressway", lat: 6.4698, lng: 3.5852, coverage: "high" },
  { id: "festac", name: "Festac Town", detail: "23 Road", lat: 6.4667, lng: 3.2833, coverage: "low" },
  { id: "magodo", name: "Magodo", detail: "CMD Road", lat: 6.6185, lng: 3.3857, coverage: "low" },
  { id: "ikorodu", name: "Ikorodu", detail: "Ikorodu Garage", lat: 6.6194, lng: 3.5105, coverage: "low" },
  { id: "epe", name: "Epe", detail: "Epe Town", lat: 6.5841, lng: 3.9834, coverage: "low" },
];

export const LAGOS_CENTER: [number, number] = [6.5244, 3.3792];

export function getPlace(id: string | null | undefined): Place | undefined {
  return id ? PLACES.find((p) => p.id === id) : undefined;
}

export function searchPlaces(query: string): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return PLACES;
  return PLACES.filter((p) => p.name.toLowerCase().includes(q) || p.detail.toLowerCase().includes(q));
}

/** Straight-line distance in km. */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Closest mock place to a coordinate, or null if it's clearly outside Lagos. */
export function nearestPlace(coords: { lat: number; lng: number }, maxKm = 40): Place | null {
  let best: Place | null = null;
  let bestKm = Infinity;
  for (const p of PLACES) {
    const km = haversineKm(coords, p);
    if (km < bestKm) {
      best = p;
      bestKm = km;
    }
  }
  return bestKm <= maxKm ? best : null;
}
