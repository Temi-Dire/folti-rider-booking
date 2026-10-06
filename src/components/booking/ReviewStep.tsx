"use client";

import { Banknote, CreditCard, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { BookingError, createBooking, quoteNow } from "@/lib/bookingService";
import { firstName } from "@/lib/format";
import { getPlace } from "@/lib/places";
import { CURRENT_USER } from "@/lib/user";
import { type Step } from "@/state/bookingReducer";
import { useBooking } from "@/state/BookingProvider";
import { Button } from "../ui/Button";
import { Notice } from "../ui/Notice";
import { SegmentedControl } from "../ui/SegmentedControl";
import { StepHeader } from "./StepHeader";
import { StepLayout } from "./StepLayout";
import { TripTicket } from "./TripTicket";

export function ReviewStep() {
  const { state, dispatch } = useBooking();
  const { draft } = state;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickup = getPlace(draft.pickupId)!;
  const destination = getPlace(draft.destinationId)!;
  const scheduledAt = draft.timing === "scheduled" && draft.scheduledAt ? new Date(draft.scheduledAt) : null;
  const req = { pickupId: pickup.id, destinationId: destination.id, timing: draft.timing, scheduledAt: draft.scheduledAt };
  const option = quoteNow(req).options.find((o) => o.category.id === draft.vehicleId);
  const forSomeone = draft.rider.mode === "other";
  const go = (step: Step) => dispatch({ type: "goTo", step });

  // The car may have become unavailable (e.g. the trip changed); send the rider back to choose again.
  useEffect(() => {
    if (!option) dispatch({ type: "goTo", step: "vehicle" });
  }, [option, dispatch]);
  if (!option) return null;

  async function book() {
    setSubmitting(true);
    setError(null);
    try {
      const booking = await createBooking({ ...req, vehicleId: option!.category.id, booker: CURRENT_USER, rider: draft.rider });
      dispatch({ type: "bookingCreated", booking });
    } catch (e) {
      setError(e instanceof BookingError ? e.message : "Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  const label = `${scheduledAt ? "Schedule" : "Book"} ${option.category.name}${forSomeone && draft.rider.name.trim() ? ` for ${firstName(draft.rider.name)}` : ""}`;

  return (
    <StepLayout
      header={<StepHeader step="review" title="Check your trip" onBack={() => go("rider")} backLabel="Back to rider details" />}
      footer={
        <Button onClick={book} loading={submitting}>
          {submitting ? "Booking…" : error ? "Try again" : label}
        </Button>
      }
    >
      {error && (
        <div className="mb-3">
          <Notice tone="error" role="alert">{error}</Notice>
        </div>
      )}

      <TripTicket
        pickup={pickup}
        destination={destination}
        scheduledAt={scheduledAt}
        etaMin={option.etaMin}
        vehicle={option.category}
        rider={draft.rider}
        fare={option.fare}
        payment={draft.payment === "cash" ? "Cash" : "Card •• 4242"}
      />

      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Edit booking">
        <EditChip onClick={() => go("trip")}>Trip</EditChip>
        <EditChip onClick={() => go("vehicle")}>Car</EditChip>
        <EditChip onClick={() => go("rider")}>Rider</EditChip>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[13px] font-medium text-muted">Pay with</p>
        <SegmentedControl
          label="Payment method"
          value={draft.payment}
          onChange={(payment) => dispatch({ type: "setPayment", payment })}
          options={[
            { value: "cash", label: "Cash", icon: Banknote },
            { value: "card", label: "Card •• 4242", icon: CreditCard },
          ]}
        />
        <p className="mt-2 text-[12.5px] text-muted">
          {draft.payment === "cash" ? "Pay the driver at the end of the trip." : "Charged after the trip. This is a demo card."}
        </p>
      </div>
    </StepLayout>
  );
}

function EditChip({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full bg-chip px-3 py-1.5 text-[13px] font-semibold hover:bg-white/15"
    >
      <Pencil className="size-3.5" aria-hidden />
      <span className="sr-only">Edit</span> {children}
    </button>
  );
}
