"use client";

import { useEffect, useRef } from "react";
import { formatTime } from "@/lib/format";
import { bookableDays, sameDay, slotsForDay } from "@/lib/schedule";

interface Props {
  value: Date | null;
  now: Date;
  onChange: (at: Date) => void;
  error?: string;
}

const dayName = (d: Date, now: Date) =>
  sameDay(d, now) ? "Today" : d.toLocaleDateString("en-GB", { weekday: "short" });

/** Day strip + time chips. Only bookable (future, within limits) slots are offered. */
export function SchedulePicker({ value, now, onChange, error }: Props) {
  const days = bookableDays(now);
  const selectedDay = value && days.some((d) => sameDay(d, value)) ? value : null;
  const slots = selectedDay ? slotsForDay(selectedDay, now) : [];
  const timeRow = useRef<HTMLDivElement>(null);

  // Keep the chosen time visible when the day changes.
  useEffect(() => {
    timeRow.current?.querySelector<HTMLElement>("[aria-checked='true']")?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [value?.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps

  function pickDay(day: Date) {
    const daySlots = slotsForDay(day, now);
    if (!daySlots.length) return;
    // Keep the time of day already chosen; otherwise suggest 8:00 AM, or the earliest slot left today.
    const at = (h: number, m: number) => daySlots.find((s) => s.getHours() === h && s.getMinutes() === m);
    const keep = value ? at(value.getHours(), value.getMinutes()) : undefined;
    onChange(keep ?? at(8, 0) ?? daySlots.find((s) => s.getHours() >= 8) ?? daySlots[0]);
  }

  return (
    <div className="mt-4 space-y-4">
      <div>
        <p id="day-label" className="mb-2 text-[13px] font-medium text-muted">Day</p>
        <div role="radiogroup" aria-labelledby="day-label" className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
          {days.map((d) => {
            const on = !!selectedDay && sameDay(d, selectedDay);
            return (
              <button
                key={d.toDateString()}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                onClick={() => pickDay(d)}
                className={`flex w-[54px] shrink-0 flex-col items-center rounded-2xl py-2 text-[11.5px] transition-colors ${
                  on ? "bg-dusk text-night" : "bg-chip text-muted hover:text-ink"
                }`}
              >
                {dayName(d, now)}
                <span className={`font-display text-[17px] font-semibold ${on ? "text-night" : "text-ink"}`}>{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div>
          <p id="time-label" className="mb-2 text-[13px] font-medium text-muted">Pickup time</p>
          <div ref={timeRow} role="radiogroup" aria-labelledby="time-label" className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
            {slots.map((s) => {
              const on = !!value && s.getTime() === value.getTime();
              return (
                <button
                  key={s.getTime()}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onChange(s)}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-[13.5px] font-semibold whitespace-nowrap transition-colors ${
                    on ? "bg-dusk text-night" : "bg-chip text-ink hover:bg-white/15"
                  }`}
                >
                  {formatTime(s)}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {error && <p className="text-[13px] text-stop" role="alert">{error}</p>}
    </div>
  );
}
