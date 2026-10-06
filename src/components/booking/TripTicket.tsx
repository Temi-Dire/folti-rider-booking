import { CalendarClock, Zap } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { formatNaira, formatPhone, formatWhen } from "@/lib/format";
import type { Place, RiderDetails, VehicleCategory } from "@/lib/types";
import { CURRENT_USER } from "@/lib/user";
import { normalizeNigerianPhone } from "@/lib/validation";

interface Props {
  pickup: Place;
  destination: Place;
  scheduledAt: Date | null;
  etaMin?: number | null;
  vehicle?: VehicleCategory;
  rider?: RiderDetails;
  fare?: number;
  payment?: string;
  /** Background colour behind the ticket, used to cut the perforation notches. */
  notch?: string;
  children?: ReactNode;
}

/** The trip as a paper ticket. Makes "who booked" vs "who rides" explicit. */
export function TripTicket({ pickup, destination, scheduledAt, etaMin, vehicle, rider, fare, payment, notch, children }: Props) {
  const forSomeone = rider?.mode === "other";
  return (
    <article
      aria-label="Trip summary"
      className="overflow-hidden rounded-[22px] bg-paper text-paper-ink"
      style={notch ? ({ "--notch": notch } as CSSProperties) : undefined}
    >
      {scheduledAt ? (
        <p className="flex items-center gap-2 bg-dusk-deep px-4 py-2.5 text-[13px] font-semibold text-white">
          <CalendarClock className="size-4" aria-hidden />
          Scheduled, {formatWhen(scheduledAt)}
        </p>
      ) : (
        <p className="flex items-center gap-2 bg-[#2f7d5b] px-4 py-2.5 text-[13px] font-semibold text-white">
          <Zap className="size-4" aria-hidden />
          Ride now{etaMin ? `, pickup in about ${etaMin} min` : ""}
        </p>
      )}

      <div className="grid grid-cols-[14px_1fr] items-center gap-x-3 px-4 pt-4 pb-2">
        <span className="size-3 rounded-full border-[3px] border-paper-ink" aria-hidden />
        <p className="font-semibold">
          {pickup.name}
          <span className="block text-[12.5px] font-normal text-paper-muted">{pickup.detail}</span>
        </p>
        <span className="ml-[5px] h-4 w-0.5 bg-paper-ink/20" aria-hidden />
        <span />
        <span className="size-3 rounded-[3px] bg-paper-ink" aria-hidden />
        <p className="font-semibold">
          {destination.name}
          <span className="block text-[12.5px] font-normal text-paper-muted">{destination.detail}</span>
        </p>
      </div>

      <div className="perforation" aria-hidden />

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 px-4 py-1 text-[14px]">
        {vehicle && <Row label="Car" value={vehicle.name} sub={`${vehicle.seats} seats`} />}
        {rider && (
          <Row
            label="Riding"
            value={forSomeone ? rider.name.trim() || "Not added yet" : `${CURRENT_USER.name} (you)`}
            sub={forSomeone ? formatPhone(normalizeNigerianPhone(rider.phone) ?? rider.phone) : undefined}
            highlight={forSomeone}
          />
        )}
        <Row label="Booked by" value={`${CURRENT_USER.name}${forSomeone ? " (you)" : ""}`} />
        {rider?.note && <Row label="Note" value={rider.note} />}
        {payment && <Row label="Payment" value={payment} />}
      </dl>

      {fare !== undefined && (
        <div className="flex items-end justify-between gap-3 px-4 pt-3 pb-4">
          <p className="text-[12.5px] text-paper-muted">
            Estimated fare
            <span className="block">Final price depends on traffic</span>
          </p>
          <p className="font-display text-[26px] leading-none font-semibold">{formatNaira(fare)}</p>
        </div>
      )}
      {children}
    </article>
  );
}

function Row({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <>
      <dt className="text-paper-muted">{label}</dt>
      <dd className="min-w-0 text-right font-semibold break-words">
        {highlight ? <mark className="rounded bg-danfo px-1.5 py-0.5 text-paper-ink">{value}</mark> : value}
        {sub && <span className="mt-0.5 block text-[12.5px] font-normal text-paper-muted">{sub}</span>}
      </dd>
    </>
  );
}
