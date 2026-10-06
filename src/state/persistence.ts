import { checkScheduledTime } from "@/lib/schedule";
import { hasErrors, validateTrip } from "@/lib/validation";
import { type BookingState, initialState } from "./bookingReducer";

const KEY = "folti.rider.v1";

export function loadState(now = new Date()): BookingState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initialState;
    const saved = JSON.parse(raw) as BookingState;
    const state: BookingState = { ...initialState, ...saved, draft: { ...initialState.draft, ...saved.draft } };

    // A saved scheduled time may have passed since the last visit.
    if (state.draft.scheduledAt && checkScheduledTime(new Date(state.draft.scheduledAt), now)) {
      state.draft = { ...state.draft, scheduledAt: null, vehicleId: null };
    }
    // Never resume mid-flow with an invalid trip.
    if (state.step !== "trip" && state.step !== "confirmed" && hasErrors(validateTrip(state.draft, now))) {
      state.step = "trip";
    }
    if (state.step === "confirmed" && !state.booking) state.step = "trip";
    return state;
  } catch {
    return initialState;
  }
}

export function saveState(state: BookingState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked (private mode): the app still works, it just won't remember.
  }
}
