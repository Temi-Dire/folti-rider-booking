"use client";

import { createContext, type Dispatch, type ReactNode, useContext, useEffect, useReducer } from "react";
import { type Action, bookingReducer, type BookingState, initialState } from "./bookingReducer";
import { loadState, saveState } from "./persistence";

interface Ctx {
  state: BookingState;
  dispatch: Dispatch<Action>;
  /** False until the saved booking has been read from the browser. */
  hydrated: boolean;
}

const BookingContext = createContext<Ctx | null>(null);

type Root = { hydrated: boolean; data: BookingState };

const rootReducer = (s: Root, a: Action): Root =>
  a.type === "hydrate" ? { hydrated: true, data: a.state } : { hydrated: s.hydrated, data: bookingReducer(s.data, a) };

export function BookingProvider({ children }: { children: ReactNode }) {
  const [{ hydrated, data: state }, dispatch] = useReducer(rootReducer, { hydrated: false, data: initialState });

  // localStorage only exists in the browser, so the saved state is loaded after mount.
  useEffect(() => dispatch({ type: "hydrate", state: loadState() }), []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  return <BookingContext.Provider value={{ state, dispatch, hydrated }}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}
