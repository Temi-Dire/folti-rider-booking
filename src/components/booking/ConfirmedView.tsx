"use client";

import { Check, Copy, MessageSquareText, Phone, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { assignDriver } from "@/lib/bookingService";
import { firstName, formatNaira, formatPhone, formatTime, formatWhen, initials } from "@/lib/format";
import { getPlace } from "@/lib/places";
import type { Booking } from "@/lib/types";
import { getVehicle } from "@/lib/vehicles";
import { useBooking } from "@/state/BookingProvider";
import { Button } from "../ui/Button";
import { StepLayout } from "./StepLayout";

export function ConfirmedView({ booking }: { booking: Booking }) {
  const { dispatch } = useBooking();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const assigning = useRef<string | null>(null);

  const pickup = getPlace(booking.pickupId)!;
  const destination = getPlace(booking.destinationId)!;
  const vehicle = getVehicle(booking.vehicleId)!;
  const scheduledAt = booking.scheduledAt ? new Date(booking.scheduledAt) : null;
  const forSomeone = booking.rider.mode === "other";
  const riderFirst = forSomeone ? firstName(booking.rider.name) : null;

  // Ride now: simulate the driver network accepting the trip.
  useEffect(() => {
    if (booking.status !== "finding_driver" || assigning.current === booking.ref) return;
    assigning.current = booking.ref;
    assignDriver(booking).then((b) => dispatch({ type: "bookingUpdated", booking: b }));
  }, [booking, dispatch]);

  const title = scheduledAt
    ? forSomeone ? `Booked for ${riderFirst}` : "Your ride is booked"
    : booking.status === "finding_driver" ? "Finding a driver" : forSomeone ? `Driver on the way to ${riderFirst}` : "Your driver is on the way";

  return (
    <StepLayout
      footer={
        confirmCancel ? (
          <div role="alertdialog" aria-labelledby="cancel-q" className="rounded-2xl bg-chip p-3">
            <p id="cancel-q" className="mb-2.5 text-[14px] font-semibold">Cancel this booking? {scheduledAt ? "It's free until an hour before pickup." : "It's free in the first 2 minutes."}</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={() => setConfirmCancel(false)}>Keep it</Button>
              <Button variant="danger" onClick={() => dispatch({ type: "cancelBooking", ref: booking.ref })}>Cancel booking</Button>
            </div>
          </div>
        ) : (
          <>
            <Button onClick={() => dispatch({ type: "startOver" })}>Book another ride</Button>
            <Button variant="ghost" onClick={() => setConfirmCancel(true)}>Cancel booking</Button>
          </>
        )
      }
    >
      <div aria-live="polite">
        {booking.status === "finding_driver" ? (
          <span className="relative mb-4 grid size-14 place-items-center" aria-hidden>
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-danfo/50" />
            <span className="relative size-5 rounded-full bg-danfo" />
          </span>
        ) : (
          <span className="mb-4 grid size-14 place-items-center rounded-full bg-go text-night" aria-hidden>
            <Check className="size-7" strokeWidth={2.6} />
          </span>
        )}
        <h2 className="font-display text-[22px] leading-tight font-semibold">{title}</h2>
        <p className="mt-2 text-[14.5px] text-muted">
          {scheduledAt
            ? `Pickup at ${pickup.name}, ${formatWhen(scheduledAt)}. We'll assign a driver by ${formatTime(new Date(scheduledAt.getTime() - 30 * 60_000))}${forSomeone && booking.rider.notify ? ` and text ${riderFirst} their details` : ""}.`
            : booking.status === "finding_driver"
              ? `Matching you with a ${vehicle.name} driver near ${pickup.name}. This usually takes under a minute.`
              : forSomeone && booking.rider.notify
                ? `We've texted ${riderFirst} the driver details and a live trip link.`
                : `Meet your driver at ${pickup.name}, ${pickup.detail}.`}
        </p>
      </div>

      {booking.driver && <DriverCard booking={booking} />}

      <BookingRef value={booking.ref} />

      {scheduledAt && (
        <ol className="mt-4 space-y-0 text-[14px]">
          <TimelineItem done title="Booked" sub={`Today, ${formatTime(new Date(booking.createdAt))}`} />
          <TimelineItem title="Driver assigned" sub={`By ${formatTime(new Date(scheduledAt.getTime() - 30 * 60_000))}, ${formatWhen(scheduledAt).split(",")[0]}`} />
          <TimelineItem title={`Pickup at ${pickup.name}`} sub={formatWhen(scheduledAt)} last />
        </ol>
      )}

      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-2xl bg-chip px-4 py-3 text-[13.5px]">
        <dt className="text-muted">Trip</dt>
        <dd className="text-right font-semibold">{pickup.name} to {destination.name}</dd>
        <dt className="text-muted">Car</dt>
        <dd className="text-right font-semibold">{vehicle.name}</dd>
        <dt className="text-muted">Riding</dt>
        <dd className="text-right font-semibold">
          {forSomeone ? `${booking.rider.name}, ${formatPhone(booking.rider.phone)}` : "You"}
        </dd>
        <dt className="text-muted">Booked by</dt>
        <dd className="text-right font-semibold">{booking.booker.name}{forSomeone ? " (you)" : ""}</dd>
        <dt className="text-muted">Estimated fare</dt>
        <dd className="text-right font-semibold">{formatNaira(booking.fare)}</dd>
      </dl>
    </StepLayout>
  );
}

function DriverCard({ booking }: { booking: Booking }) {
  const d = booking.driver!;
  return (
    <div className="mt-4 rounded-[22px] bg-paper p-4 text-paper-ink animate-sheet-in">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-full bg-paper-ink font-bold text-paper">{initials(d.name)}</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{d.name}</p>
          <p className="flex items-center gap-1 text-[13px] text-paper-muted">
            <Star className="size-3.5 fill-current" aria-hidden />
            {d.rating} <span className="sr-only">stars</span>, {d.colour} {d.car}
          </p>
        </div>
        <p className="text-right">
          <span className="font-display text-[20px] leading-none font-semibold">{booking.etaMin ?? 4} min</span>
          <span className="block text-[12px] text-paper-muted">away</span>
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="rounded-lg border-2 border-paper-ink px-2.5 py-1 font-display text-[15px] font-semibold tracking-wider">{d.plate}</span>
        <div className="flex gap-2">
          <a href={`tel:${d.phone}`} aria-label={`Call ${d.name}`} className="grid size-10 place-items-center rounded-full bg-paper-ink/10 hover:bg-paper-ink/20">
            <Phone className="size-4.5" aria-hidden />
          </a>
          <a href={`sms:${d.phone}`} aria-label={`Message ${d.name}`} className="grid size-10 place-items-center rounded-full bg-paper-ink/10 hover:bg-paper-ink/20">
            <MessageSquareText className="size-4.5" aria-hidden />
          </a>
        </div>
      </div>
    </div>
  );
}

function BookingRef({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* Clipboard blocked: the reference is still visible to copy by hand. */
    }
  }
  return (
    <div className="mt-4 flex items-center justify-between rounded-[18px] border border-line bg-field px-4 py-3">
      <div>
        <p className="text-[12.5px] text-muted">Booking reference</p>
        <p className="font-display text-[20px] font-semibold tracking-wide">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-full bg-chip px-3 py-2 text-[13px] font-semibold hover:bg-white/15"
      >
        {copied ? <Check className="size-4 text-go" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}

function TimelineItem({ title, sub, done, last }: { title: string; sub: string; done?: boolean; last?: boolean }) {
  return (
    <li className="grid grid-cols-[20px_1fr] gap-x-3">
      <span className="flex flex-col items-center">
        <span className={`mt-1 size-3 rounded-full ${done ? "bg-go" : "border-2 border-muted"}`} aria-hidden />
        {!last && <span className="my-1 w-0.5 flex-1 bg-line" aria-hidden />}
      </span>
      <span className={last ? "" : "pb-3"}>
        <span className="block font-semibold">{title}{done && <span className="sr-only"> (done)</span>}</span>
        <span className="block text-[12.5px] text-muted">{sub}</span>
      </span>
    </li>
  );
}
