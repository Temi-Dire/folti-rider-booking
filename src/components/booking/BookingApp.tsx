"use client";

import dynamic from "next/dynamic";
import { ChevronUp, History } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { quoteNow } from "@/lib/bookingService";
import { getPlace } from "@/lib/places";
import { CURRENT_USER } from "@/lib/user";
import { initials } from "@/lib/format";
import { useBooking } from "@/state/BookingProvider";
import type { MapPadding } from "../map/TripMap";
import { ConfirmedView } from "./ConfirmedView";
import { ReviewStep } from "./ReviewStep";
import { RiderStep } from "./RiderStep";
import { TripsList } from "./TripsList";
import { TripStep } from "./TripStep";
import { TripTicket } from "./TripTicket";
import { VehicleStep } from "./VehicleStep";

// Leaflet touches `window`, so the map only renders in the browser.
const TripMap = dynamic(() => import("../map/TripMap"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-land" />,
});

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

export function BookingApp() {
  const { state, hydrated } = useBooking();
  const { step, draft, booking } = state;
  const [showTrips, setShowTrips] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(0);
  const desktop = useIsDesktop();
  // The sheet can be minimised on phones to see the map. It opens again whenever the screen changes.
  const viewKey = showTrips ? "trips" : step;
  const [minimizedOn, setMinimizedOn] = useState<string | null>(null);
  const minimized = !desktop && minimizedOn === viewKey;
  const dragStart = useRef<number | null>(null);
  const swiped = useRef(false);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setPanelHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pickup = getPlace(step === "confirmed" ? booking?.pickupId : draft.pickupId);
  const destination = getPlace(step === "confirmed" ? booking?.destinationId : draft.destinationId);
  const showSummary = desktop && !showTrips && (step === "vehicle" || step === "rider") && pickup && destination;

  // Keep the route visible in the gap the panels leave free.
  const padding: MapPadding = desktop
    ? { topLeft: [480, 110], bottomRight: [showSummary ? 400 : 60, 60] }
    : { topLeft: [40, 90], bottomRight: [40, panelHeight + 30] };

  const sheetTitle = showTrips
    ? "Your trips"
    : step === "confirmed"
      ? `Booked, ${booking?.ref ?? ""}`
      : { trip: "Where to?", vehicle: "Choose a car", rider: "Who's riding?", review: "Check your trip" }[step];

  const scheduledAt = draft.timing === "scheduled" && draft.scheduledAt ? new Date(draft.scheduledAt) : null;
  const option =
    showSummary && draft.vehicleId
      ? quoteNow({ pickupId: pickup.id, destinationId: destination.id, timing: draft.timing, scheduledAt: draft.scheduledAt }).options.find(
          (o) => o.category.id === draft.vehicleId,
        )
      : undefined;

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-night">
      <TripMap pickup={pickup} destination={destination} showCars={step === "vehicle" && draft.timing === "now"} padding={padding} />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 p-3 pt-[max(12px,env(safe-area-inset-top))] lg:px-6 lg:pt-5">
        <div className="glass pointer-events-auto flex h-12 items-center gap-2.5 rounded-full pr-4 pl-3 shadow-lg shadow-black/30">
          <span className="grid size-7 place-items-center rounded-lg bg-danfo font-display text-[14px] font-semibold text-on-danfo">F</span>
          <span className="font-display text-[16px] font-semibold">Folti</span>
        </div>
        <div className="glass pointer-events-auto flex h-12 items-center gap-1 rounded-full p-1.5 shadow-lg shadow-black/30">
          <button
            type="button"
            onClick={() => setShowTrips((v) => !v)}
            aria-pressed={showTrips}
            className="flex h-9 items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold hover:bg-chip aria-pressed:bg-chip"
          >
            <History className="size-4" aria-hidden />
            Trips
            {state.history.length > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-danfo px-1 text-[11px] text-on-danfo">
                {state.history.length}
              </span>
            )}
          </button>
          <span
            className="grid size-9 place-items-center rounded-full bg-chip text-[12px] font-bold"
            title={`Signed in as ${CURRENT_USER.name}`}
          >
            {initials(CURRENT_USER.name)}
          </span>
        </div>
      </header>

      <section
        ref={panelRef}
        aria-label="Book a ride"
        className="glass absolute inset-x-2 bottom-2 z-10 md:right-auto md:bottom-4 md:left-4 md:w-[440px] flex max-h-[min(82dvh,calc(100dvh-84px))] flex-col rounded-[28px] px-4 pt-2.5 pb-[max(16px,env(safe-area-inset-bottom))] shadow-2xl shadow-black/50 lg:top-[88px] lg:right-auto lg:bottom-auto lg:left-6 lg:max-h-[calc(100dvh-112px)] lg:w-[420px] lg:px-5 lg:pt-5 lg:pb-5"
      >
        {/* Grab handle: tap or swipe down to minimise, tap or swipe up to open. Phones only. */}
        <button
          type="button"
          aria-expanded={!minimized}
          aria-label={minimized ? "Show booking panel" : "Minimise booking panel"}
          onClick={() => {
            // A swipe also ends in a click; ignore it so the swipe decides.
            if (swiped.current) return void (swiped.current = false);
            setMinimizedOn(minimized ? null : viewKey);
          }}
          onPointerDown={(e) => (dragStart.current = e.clientY)}
          onPointerUp={(e) => {
            const dy = dragStart.current === null ? 0 : e.clientY - dragStart.current;
            dragStart.current = null;
            if (Math.abs(dy) < 30) return;
            swiped.current = true;
            setMinimizedOn(dy > 0 ? viewKey : null);
          }}
          className="-mx-4 -mt-2.5 flex shrink-0 touch-none justify-center pt-2.5 pb-3 lg:hidden"
        >
          <span className="h-1 w-10 rounded-full bg-line" aria-hidden />
        </button>
        {minimized && (
          <button
            type="button"
            onClick={() => setMinimizedOn(null)}
            className="flex w-full items-center justify-between gap-3 pb-1 text-left"
          >
            <span className="min-w-0">
              <span className="block font-display text-[16px] font-semibold">{sheetTitle}</span>
              {pickup && destination && (
                <span className="block truncate text-[13px] text-muted">
                  {pickup.name} to {destination.name}
                </span>
              )}
            </span>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-chip">
              <ChevronUp className="size-5" aria-hidden />
            </span>
          </button>
        )}
        <div className={minimized ? "hidden" : "contents"}>
          {!hydrated ? (
            <div className="space-y-3 pb-2" aria-busy="true" aria-label="Loading">
              <div className="skeleton h-6 w-32 rounded" />
              <div className="skeleton h-28 rounded-2xl" />
              <div className="skeleton h-12 rounded-full" />
            </div>
          ) : showTrips ? (
            <TripsList onClose={() => setShowTrips(false)} />
          ) : step === "confirmed" && booking ? (
            <ConfirmedView booking={booking} />
          ) : step === "vehicle" ? (
            <VehicleStep />
          ) : step === "rider" ? (
            <RiderStep />
          ) : step === "review" ? (
            <ReviewStep />
          ) : (
            <TripStep />
          )}
        </div>
      </section>

      {showSummary && (
        <aside className="absolute top-[88px] right-6 z-10 w-[340px] animate-sheet-in" aria-label="Trip so far">
          <TripTicket
            pickup={pickup}
            destination={destination}
            scheduledAt={scheduledAt}
            etaMin={option?.etaMin}
            vehicle={option?.category}
            rider={step === "rider" ? draft.rider : undefined}
            fare={option?.fare}
            notch="transparent"
          />
        </aside>
      )}
    </main>
  );
}
