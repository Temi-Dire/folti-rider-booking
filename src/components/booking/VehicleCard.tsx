import { Clock, TrendingUp, Users } from "lucide-react";
import { formatNaira } from "@/lib/format";
import type { VehicleOption } from "@/lib/types";
import { CarIllustration } from "../vehicle/CarIllustration";

interface Props {
  option: VehicleOption;
  selected: boolean;
  /** "Available for 6:00 AM" for scheduled rides. */
  scheduledLabel: string | null;
  name: string;
  onSelect: () => void;
}

export function VehicleCard({ option, selected, scheduledLabel, name, onSelect }: Props) {
  const { category, available, reason, etaMin, fare, surge } = option;
  const status = !available ? reason : scheduledLabel ? `Available for ${scheduledLabel}` : `${etaMin} min away`;

  return (
    <label
      className={`relative flex w-[212px] shrink-0 cursor-pointer snap-start flex-col rounded-[22px] border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-danfo ${
        selected ? "border-transparent bg-danfo text-on-danfo" : "border-line bg-field hover:bg-white/[0.09]"
      } ${available ? "" : "cursor-not-allowed opacity-50"}`}
    >
      <input
        type="radio"
        name={name}
        value={category.id}
        checked={selected}
        disabled={!available}
        onChange={onSelect}
        className="sr-only"
        aria-describedby={`${category.id}-status`}
      />
      <CarIllustration id={category.id} className="h-[56px] w-[108px]" />
      <span className="mt-2 flex items-baseline justify-between gap-2">
        <span className="font-display text-[16px] font-semibold">{category.name}</span>
        <span className={`inline-flex items-center gap-1 text-[12.5px] ${selected ? "text-on-danfo/70" : "text-muted"}`}>
          <Users className="size-3.5" aria-hidden />
          {category.seats}
          <span className="sr-only">seats</span>
        </span>
      </span>
      <span
        id={`${category.id}-status`}
        className={`mt-0.5 flex items-center gap-1 text-[12.5px] font-medium ${
          !available ? "text-stop" : selected ? "text-on-danfo/80" : "text-go"
        }`}
      >
        {available && !scheduledLabel && <Clock className="size-3.5" aria-hidden />}
        {status}
      </span>
      <span className="mt-2.5 flex flex-wrap gap-1">
        {category.features.map((f) => (
          <span key={f} className={`rounded-full px-2 py-0.5 text-[11.5px] ${selected ? "bg-black/10" : "bg-chip text-muted"}`}>
            {f}
          </span>
        ))}
      </span>
      <span className="mt-auto flex items-end justify-between pt-3">
        <span className="font-display text-[19px] leading-none font-semibold">
          {formatNaira(fare)}
          <span className={`ml-1 font-sans text-[12px] font-medium ${selected ? "text-on-danfo/70" : "text-muted"}`}>est.</span>
        </span>
        {surge && (
          <span title="Busy hours (weekdays 7 to 10 AM, 5 to 8 PM) cost a little more" className={`inline-flex items-center gap-0.5 text-[11.5px] ${selected ? "text-on-danfo/70" : "text-muted"}`}>
            <TrendingUp className="size-3.5" aria-hidden />
            Busy
          </span>
        )}
      </span>
    </label>
  );
}

export function VehicleCardSkeleton() {
  return (
    <div className="flex w-[212px] shrink-0 flex-col gap-2 rounded-[22px] border border-line bg-field p-4" aria-hidden>
      <div className="skeleton h-[66px] w-[128px] rounded-xl" />
      <div className="skeleton mt-2 h-4 w-24 rounded" />
      <div className="skeleton h-3 w-20 rounded" />
      <div className="mt-2 flex gap-1">
        <div className="skeleton h-4 w-14 rounded-full" />
        <div className="skeleton h-4 w-10 rounded-full" />
      </div>
      <div className="skeleton mt-4 h-5 w-20 rounded" />
    </div>
  );
}
