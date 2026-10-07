"use client";

import { ChevronLeft, Route } from "lucide-react";
import { formatNaira, formatWhen } from "@/lib/format";
import { getPlace } from "@/lib/places";
import { getVehicle } from "@/lib/vehicles";
import { useBooking } from "@/state/BookingProvider";

/** Bookings made on this device (saved in the browser). */
export function TripsList({ onClose }: { onClose: () => void }) {
  const { state } = useBooking();
  const trips = state.history;

  return (
    <div className="flex min-h-0 flex-1 flex-col animate-sheet-in">
      <div className="mb-4 flex shrink-0 items-center gap-3">
        <button type="button" onClick={onClose} aria-label="Close trips" className="grid size-10 place-items-center rounded-full bg-chip hover:bg-white/15">
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <h2 className="font-display text-[20px] font-semibold">Your trips</h2>
      </div>
      <div className="no-scrollbar -mx-4 min-h-0 flex-1 overflow-y-auto px-4">
        {trips.length === 0 ? (
          <div className="py-6">
            <div className="mb-4 grid h-24 place-items-center rounded-3xl bg-chip text-muted">
              <Route className="size-9" strokeWidth={1.5} aria-hidden />
            </div>
            <p className="font-semibold">No trips yet</p>
            <p className="mt-1 text-[14px] text-muted">Rides you book, for you or someone else, show up here.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {trips.map((b) => {
              const at = b.scheduledAt ? new Date(b.scheduledAt) : new Date(b.createdAt);
              return (
                <li key={b.ref} className="rounded-2xl border border-line bg-field px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">
                      {getPlace(b.pickupId)?.name} to {getPlace(b.destinationId)?.name}
                    </p>
                    <p className="shrink-0 font-semibold">{formatNaira(b.fare)}</p>
                  </div>
                  <p className="mt-0.5 text-[13px] text-muted">
                    {formatWhen(at)}, {getVehicle(b.vehicleId)?.name}
                    {b.rider.mode === "other" ? `, for ${b.rider.name}` : ""}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[12.5px]">
                    <span
                      className={`rounded-full px-2 py-0.5 font-semibold ${
                        b.status === "scheduled" ? "bg-dusk-soft text-dusk" : "bg-go-soft text-go"
                      }`}
                    >
                      {b.status === "scheduled" ? "Upcoming" : b.status === "driver_assigned" ? "Driver assigned" : "Finding driver"}
                    </span>
                    <span className="font-display text-muted">{b.ref}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
