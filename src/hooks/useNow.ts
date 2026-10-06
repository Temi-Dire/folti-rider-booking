"use client";

import { useEffect, useState } from "react";

/** Current time, refreshed every `intervalMs` so time-based rules (like "no past pickups") stay correct. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
