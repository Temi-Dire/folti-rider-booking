"use client";

import { ArrowDownUp, CalendarClock, CircleAlert, Zap } from "lucide-react";
import { useState } from "react";
import { quoteNow } from "@/lib/bookingService";
import { formatDuration, formatKm, formatNaira, formatTime, formatWhen } from "@/lib/format";
import { getPlace } from "@/lib/places";
import { hasErrors, validateTrip } from "@/lib/validation";
import { useNow } from "@/hooks/useNow";
import { useBooking } from "@/state/BookingProvider";
import { Button } from "../ui/Button";
import { Notice } from "../ui/Notice";
import { SegmentedControl } from "../ui/SegmentedControl";
import { PlacePicker } from "./PlacePicker";
import { SchedulePicker } from "./SchedulePicker";
import { StepHeader } from "./StepHeader";
import { StepLayout } from "./StepLayout";

export function TripStep() {
  const { state, dispatch } = useBooking();
  const { draft } = state;
  const now = useNow();
  const [picking, setPicking] = useState<"pickup" | "destination" | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const pickup = getPlace(draft.pickupId);
  const destination = getPlace(draft.destinationId);
  const scheduledAt = draft.scheduledAt ? new Date(draft.scheduledAt) : null;
  const errors = validateTrip(draft, now);
  const shown = submitted ? errors : {};

  // Live estimate so the rider sees distance and a starting price before choosing a car.
  const quote =
    pickup && destination && pickup.id !== destination.id && !errors.schedule
      ? quoteNow({ pickupId: pickup.id, destinationId: destination.id, timing: draft.timing, scheduledAt: draft.scheduledAt })
      : null;
  const cheapest = quote ? Math.min(...quote.options.map((o) => o.fare)) : null;

  if (picking) {
    return (
      <PlacePicker
        field={picking}
        otherId={picking === "pickup" ? draft.destinationId : draft.pickupId}
        onClose={() => setPicking(null)}
        onPick={(p) => {
          dispatch({ type: picking === "pickup" ? "setPickup" : "setDestination", id: p.id });
          // After choosing pickup, go straight to destination if it's still empty.
          setPicking(picking === "pickup" && !draft.destinationId ? "destination" : null);
        }}
      />
    );
  }

  function next() {
    setSubmitted(true);
    if (hasErrors(errors)) return;
    dispatch({ type: "goTo", step: "vehicle" });
  }

  return (
    <StepLayout
      header={<StepHeader step="trip" title={draft.timing === "scheduled" ? "Plan a ride" : "Where to?"} />}
      footer={
        <Button onClick={next} trailing={cheapest ? `from ${formatNaira(cheapest)}` : undefined}>
          Choose a car
        </Button>
      }
    >
      <div className="relative rounded-2xl border border-line bg-field">
        <PlaceRow
          label="Pickup"
          value={pickup ? `${pickup.name}, ${pickup.detail}` : undefined}
          placeholder="Choose pickup point"
          marker="dot"
          error={shown.pickup}
          onClick={() => setPicking("pickup")}
        />
        <div className="ml-11 border-t border-line" />
        <PlaceRow
          label="Destination"
          value={destination ? `${destination.name}, ${destination.detail}` : undefined}
          placeholder="Where are you going?"
          marker="square"
          error={shown.destination}
          onClick={() => setPicking("destination")}
        />
        <button
          type="button"
          onClick={() => dispatch({ type: "swapPlaces" })}
          disabled={!pickup && !destination}
          aria-label="Swap pickup and destination"
          className="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-smoke text-ink hover:bg-white/10 disabled:opacity-40"
        >
          <ArrowDownUp className="size-4" aria-hidden />
        </button>
      </div>

      {quote && (
        <p className="mt-2.5 px-1 text-[13px] text-muted">
          {formatKm(quote.trip.distanceKm)}, about {formatDuration(quote.trip.durationMin)} by road
        </p>
      )}

      <div className="mt-4">
        <SegmentedControl
          label="When do you want to ride?"
          value={draft.timing}
          onChange={(timing) => dispatch({ type: "setTiming", timing })}
          options={[
            { value: "now", label: "Now", icon: Zap },
            { value: "scheduled", label: "Schedule", icon: CalendarClock, tone: "dusk" },
          ]}
        />
      </div>

      {draft.timing === "scheduled" && (
        <>
          <SchedulePicker
            value={scheduledAt}
            now={now}
            onChange={(at) => dispatch({ type: "setScheduledAt", at: at.toISOString() })}
            error={shown.schedule}
          />
          {scheduledAt && !errors.schedule && (
            <div className="mt-4">
              <Notice tone="scheduled">
                Pickup <b>{formatWhen(scheduledAt, now)}</b>. We assign a driver 30 minutes before, around{" "}
                {formatTime(new Date(scheduledAt.getTime() - 30 * 60_000))}.
              </Notice>
            </div>
          )}
        </>
      )}
    </StepLayout>
  );
}

function PlaceRow(props: {
  label: string;
  value?: string;
  placeholder: string;
  marker: "dot" | "square";
  error?: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={props.onClick} className="flex w-full items-center gap-3.5 py-3 pr-14 pl-4 text-left">
      {props.marker === "dot" ? (
        <span className="size-3 shrink-0 rounded-full border-[3px] border-ink" aria-hidden />
      ) : (
        <span className="size-3 shrink-0 rounded-[3px] bg-danfo" aria-hidden />
      )}
      <span className="min-w-0">
        <span className="block text-[12.5px] text-muted">{props.label}</span>
        {props.value ? (
          <span className="block truncate text-[15.5px] font-semibold">{props.value}</span>
        ) : (
          <span className={`block text-[15.5px] ${props.error ? "text-stop" : "text-muted/80"}`}>{props.placeholder}</span>
        )}
        {props.error && (
          <span className="mt-0.5 flex items-center gap-1 text-[12.5px] text-stop" role="alert">
            <CircleAlert className="size-3.5" aria-hidden />
            {props.error}
          </span>
        )}
      </span>
    </button>
  );
}
