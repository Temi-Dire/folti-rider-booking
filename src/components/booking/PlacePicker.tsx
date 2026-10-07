"use client";

import { ChevronLeft, LoaderCircle, LocateFixed, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { nearestPlace, searchPlaces } from "@/lib/places";
import type { Place } from "@/lib/types";
import { Notice } from "../ui/Notice";

interface Props {
  field: "pickup" | "destination";
  /** The place chosen for the other field, which can't be picked again. */
  otherId: string | null;
  onPick: (place: Place) => void;
  onClose: () => void;
}

type Locate = { state: "idle" } | { state: "locating" } | { state: "error"; message: string };

export function PlacePicker({ field, otherId, onPick, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [locate, setLocate] = useState<Locate>({ state: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const results = searchPlaces(query);

  useEffect(() => inputRef.current?.focus(), []);

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setLocate({ state: "error", message: "Your browser can't share your location. Pick a place from the list." });
      return;
    }
    setLocate({ state: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const place = nearestPlace({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (!place) {
          setLocate({ state: "error", message: "You seem to be outside Lagos. Pick a place from the list instead." });
        } else if (place.id === otherId) {
          setLocate({ state: "error", message: `You're near ${place.name}, which is already your ${field === "pickup" ? "destination" : "pickup"}.` });
        } else {
          onPick(place);
        }
      },
      () => setLocate({ state: "error", message: "Location access was blocked. Allow it in your browser, or pick a place below." }),
      { timeout: 10_000, maximumAge: 60_000 },
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col animate-sheet-in">
      <div className="mb-3 flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-chip hover:bg-white/15"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <h2 className="font-display text-[18px] font-semibold">{field === "pickup" ? "Pickup point" : "Where to?"}</h2>
      </div>

      <label className="flex h-12 shrink-0 items-center gap-2.5 rounded-2xl border border-line bg-field px-3.5 focus-within:border-ink">
        <Search className="size-4.5 text-muted" aria-hidden />
        <span className="sr-only">Search Lagos places</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          placeholder="Search an area, like Ikeja"
          className="h-full w-full bg-transparent text-[15.5px] outline-none placeholder:text-muted/70"
          autoComplete="off"
        />
      </label>

      <div className="no-scrollbar -mx-2 mt-2 min-h-0 flex-1 overflow-y-auto px-2 pb-1">
        {field === "pickup" && !query && (
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locate.state === "locating"}
            className="flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left hover:bg-chip"
          >
            <span className="grid size-9 place-items-center rounded-full bg-dusk-soft text-dusk">
              {locate.state === "locating" ? <LoaderCircle className="size-4.5 animate-spin" aria-hidden /> : <LocateFixed className="size-4.5" aria-hidden />}
            </span>
            <span className="font-semibold">{locate.state === "locating" ? "Finding you…" : "Use my current location"}</span>
          </button>
        )}
        {locate.state === "error" && (
          <div className="my-2">
            <Notice tone="error" role="alert">{locate.message}</Notice>
          </div>
        )}

        {results.length === 0 ? (
          <p className="px-2 py-6 text-[14px] text-muted">
            No places match “{query}”. Try an area like Yaba, Lekki or Ikeja.
          </p>
        ) : (
          <ul aria-label="Places">
            {results.map((p) => {
              const taken = p.id === otherId;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={taken}
                    onClick={() => onPick(p)}
                    className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left hover:bg-chip disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-chip text-muted">
                      <MapPin className="size-4.5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold">{p.name}</span>
                      <span className="block truncate text-[13px] text-muted">
                        {taken ? `Already your ${field === "pickup" ? "destination" : "pickup"}` : p.detail}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
