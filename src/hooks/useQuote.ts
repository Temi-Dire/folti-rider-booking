"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchQuote, type Quote, type QuoteRequest } from "@/lib/bookingService";

type Result = { status: "ready"; quote: Quote } | { status: "error"; message: string };
type QuoteState = { status: "loading" } | Result;

/** Loads vehicle options for a trip, refetching when the trip changes. */
export function useQuote(req: QuoteRequest) {
  const [attempt, setAttempt] = useState(0);
  const key = `${req.pickupId}|${req.destinationId}|${req.timing}|${req.scheduledAt}|${attempt}`;
  // The result is tagged with the request it answers; anything else means we're still loading.
  const [result, setResult] = useState<{ key: string; value: Result } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchQuote(req)
      .then((quote) => !cancelled && setResult({ key, value: { status: "ready", quote } }))
      .catch(
        () => !cancelled && setResult({ key, value: { status: "error", message: "Couldn't load cars. Check your connection and try again." } }),
      );
    return () => {
      cancelled = true;
    };
    // `key` captures every field of req.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const state: QuoteState = result?.key === key ? result.value : { status: "loading" };
  return { ...state, retry };
}
