"use client";

import { CalendarClock, CarFront, RefreshCw } from "lucide-react";
import { type ReactNode, useEffect, useId } from "react";
import { formatDuration, formatKm, formatNaira, formatTime, formatWhen } from "@/lib/format";
import { getPlace } from "@/lib/places";
import { useQuote } from "@/hooks/useQuote";
import { useBooking } from "@/state/BookingProvider";
import { TimingBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Notice } from "../ui/Notice";
import { StepHeader } from "./StepHeader";
import { StepLayout } from "./StepLayout";
import { VehicleCard, VehicleCardSkeleton } from "./VehicleCard";

export function VehicleStep() {
  const { state, dispatch } = useBooking();
  const { draft } = state;
  const name = useId();
  const pickup = getPlace(draft.pickupId)!;
  const scheduledAt = draft.timing === "scheduled" && draft.scheduledAt ? new Date(draft.scheduledAt) : null;
  const q = useQuote({
    pickupId: draft.pickupId!,
    destinationId: draft.destinationId!,
    timing: draft.timing,
    scheduledAt: draft.scheduledAt,
  });

  const options = q.status === "ready" ? q.quote.options : [];
  const available = options.filter((o) => o.available);
  const selected = options.find((o) => o.category.id === draft.vehicleId && o.available);

  // Pre-select the first available car so the rider can continue with one tap.
  useEffect(() => {
    if (q.status === "ready" && !selected && available[0]) dispatch({ type: "selectVehicle", id: available[0].category.id });
  }, [q.status, selected, available, dispatch]);

  const back = () => dispatch({ type: "goTo", step: "trip" });
  const subtitle =
    q.status === "ready"
      ? `${formatKm(q.quote.trip.distanceKm)}, about ${formatDuration(q.quote.trip.durationMin)}`
      : `From ${pickup.name}`;
  const header = <StepHeader step="vehicle" title="Choose a car" subtitle={subtitle} onBack={back} backLabel="Back to trip" />;

  if (q.status === "error") {
    return (
      <StepLayout header={header} footer={<Button onClick={q.retry}>Try again</Button>}>
        <Notice tone="error" role="alert">
          {q.message}
        </Notice>
      </StepLayout>
    );
  }

  if (q.status === "ready" && available.length === 0) {
    return <NoCars pickupName={pickup.name} scheduled={!!scheduledAt} header={header} onRetry={q.retry} />;
  }

  return (
    <StepLayout
      header={
        <>
          {header}
          {/* Pinned with the header so it stays visible while the cars scroll. */}
          <div className="mb-3">
            <TimingBadge scheduledLabel={scheduledAt ? formatWhen(scheduledAt) : null} />
          </div>
        </>
      }
      footer={
        <>
          {/* Details stay pinned above the button; only the car list scrolls. */}
          {selected && (
            <dl className="grid grid-cols-3 gap-1.5 text-[12px]">
              <Detail label="Seats" value={`${selected.category.seats} people`} />
              {scheduledAt ? (
                <Detail label="Pickup" value={formatTime(scheduledAt)} />
              ) : (
                <Detail label="Pickup in" value={`${selected.etaMin} min`} />
              )}
              <Detail
                label="Free cancel"
                value={scheduledAt ? `Until ${formatTime(new Date(scheduledAt.getTime() - 60 * 60_000))}` : "For 2 min"}
              />
            </dl>
          )}
          <Button
            disabled={!selected}
            onClick={() => dispatch({ type: "goTo", step: "rider" })}
            trailing={selected ? formatNaira(selected.fare) : undefined}
          >
            {selected ? `Continue with ${selected.category.name}` : "Choose a car"}
          </Button>
        </>
      }
    >
      <div aria-live="polite" className="sr-only">
        {q.status === "loading" ? `Finding cars near ${pickup.name}` : `${available.length} cars available`}
      </div>

      {q.status === "loading" ? (
        <>
          <p className="mb-3 text-[13.5px] text-muted">Finding cars near {pickup.name}…</p>
          <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-hidden px-4">
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
          </div>
        </>
      ) : (
        <fieldset>
          <legend className="sr-only">Car type</legend>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4 pb-1">
            {options.map((o) => (
              <VehicleCard
                key={o.category.id}
                option={o}
                name={name}
                selected={o.category.id === selected?.category.id}
                scheduledLabel={scheduledAt ? formatTime(scheduledAt) : null}
                onSelect={() => dispatch({ type: "selectVehicle", id: o.category.id })}
              />
            ))}
          </div>
        </fieldset>
      )}
    </StepLayout>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-chip px-3 py-2">
      <dt className="text-muted">{label}</dt>
      <dd className="text-[13.5px] font-semibold text-ink">{value}</dd>
    </div>
  );
}

function NoCars({
  pickupName,
  scheduled,
  header,
  onRetry,
}: {
  pickupName: string;
  scheduled: boolean;
  header: ReactNode;
  onRetry: () => void;
}) {
  const { dispatch } = useBooking();
  return (
    <StepLayout
      header={header}
      footer={
        scheduled ? (
          <Button onClick={() => dispatch({ type: "goTo", step: "trip" })}>Choose another time</Button>
        ) : (
          <>
            <Button
              onClick={() => {
                dispatch({ type: "setTiming", timing: "scheduled" });
                dispatch({ type: "goTo", step: "trip" });
              }}
            >
              <span className="inline-flex items-center gap-2">
                <CalendarClock className="size-4.5" aria-hidden />
                Schedule for later
              </span>
            </Button>
            <Button variant="ghost" onClick={onRetry}>
              <span className="inline-flex items-center gap-2">
                <RefreshCw className="size-4" aria-hidden />
                Check again
              </span>
            </Button>
          </>
        )
      }
    >
      <div role="status" className="pt-1">
        <div className="mb-4 grid h-28 place-items-center rounded-3xl bg-chip text-muted">
          <CarFront className="size-10" strokeWidth={1.5} aria-hidden />
        </div>
        <h3 className="font-display text-[18px] font-semibold">
          {scheduled ? "No cars for that time" : `No cars near ${pickupName} right now`}
        </h3>
        <p className="mt-1.5 text-[14px] text-muted">
          {scheduled
            ? "Every car is booked for that pickup time. Try a different time or day."
            : "Every car nearby is on a trip. Schedule this ride for later, or check again in a minute."}
        </p>
      </div>
    </StepLayout>
  );
}
