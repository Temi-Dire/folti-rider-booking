"use client";

import { User, Users } from "lucide-react";
import { useState } from "react";
import { firstName, formatPhone, initials } from "@/lib/format";
import { CURRENT_USER } from "@/lib/user";
import { hasErrors, type RiderErrors, validateRider } from "@/lib/validation";
import { useBooking } from "@/state/BookingProvider";
import { Button } from "../ui/Button";
import { SegmentedControl } from "../ui/SegmentedControl";
import { TextField } from "../ui/TextField";
import { Toggle } from "../ui/Toggle";
import { StepHeader } from "./StepHeader";
import { StepLayout } from "./StepLayout";

export function RiderStep() {
  const { state, dispatch } = useBooking();
  const { rider } = state.draft;
  const [touched, setTouched] = useState<Partial<Record<keyof RiderErrors, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = validateRider(rider);
  const show = (k: keyof RiderErrors) => (submitted || touched[k] ? errors[k] : undefined);
  const update = (patch: Partial<typeof rider>) => dispatch({ type: "updateRider", patch });
  const someone = rider.mode === "other";
  const riderFirst = someone && rider.name.trim() ? firstName(rider.name) : "them";

  function next() {
    setSubmitted(true);
    if (hasErrors(errors)) {
      document.getElementById(errors.name ? "rider-name" : "rider-phone")?.focus();
      return;
    }
    dispatch({ type: "goTo", step: "review" });
  }

  return (
    <StepLayout
      header={
        <StepHeader step="rider" title="Who's riding?" onBack={() => dispatch({ type: "goTo", step: "vehicle" })} backLabel="Back to cars" />
      }
      footer={<Button onClick={next}>Review booking</Button>}
    >
      <SegmentedControl
        label="Who is this ride for?"
        value={rider.mode}
        onChange={(mode) => update({ mode })}
        options={[
          { value: "self", label: "Me", icon: User },
          { value: "other", label: "Someone else", icon: Users },
        ]}
      />

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-chip px-3.5 py-3 text-[14px]">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-danfo text-[12.5px] font-bold text-on-danfo">
          {initials(CURRENT_USER.name)}
        </span>
        {someone ? (
          <span>
            You&apos;re booking as <b>{CURRENT_USER.name}</b>. The driver will contact the rider, not you.
          </span>
        ) : (
          <span>
            <b>{CURRENT_USER.name}</b>
            <span className="block text-[13px] text-muted">{formatPhone(CURRENT_USER.phone)}, the driver will call this number</span>
          </span>
        )}
      </div>

      {someone && (
        <div className="mt-4 space-y-3.5 animate-sheet-in">
          <TextField
            id="rider-name"
            label="Rider's full name"
            autoComplete="off"
            placeholder="e.g. Funke Bakare"
            value={rider.name}
            onChange={(e) => update({ name: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            error={show("name")}
          />
          <TextField
            id="rider-phone"
            label="Rider's phone number"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            placeholder="0803 456 7812"
            prefix="+234"
            value={rider.phone}
            onChange={(e) => update({ phone: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            error={show("phone")}
            hint="The driver calls this number at pickup."
          />
          <Toggle
            id="rider-notify"
            label={`Text ${riderFirst} the trip and driver details`}
            checked={rider.notify}
            onChange={(notify) => update({ notify })}
          />
        </div>
      )}

      <TextField
        id="rider-note"
        className="mt-4"
        label="Note for the driver (optional)"
        placeholder={someone ? "e.g. She has two bags, waiting at the gate" : "e.g. I'm at the blue gate"}
        maxLength={140}
        value={rider.note}
        onChange={(e) => update({ note: e.target.value })}
      />
    </StepLayout>
  );
}
