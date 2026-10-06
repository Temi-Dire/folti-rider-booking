import type { Booking, RiderDetails, TimingMode, VehicleId } from "@/lib/types";

export type Step = "trip" | "vehicle" | "rider" | "review" | "confirmed";

export const FLOW: Step[] = ["trip", "vehicle", "rider", "review"];

export type Payment = "cash" | "card";

export interface Draft {
  pickupId: string | null;
  destinationId: string | null;
  timing: TimingMode;
  scheduledAt: string | null;
  vehicleId: VehicleId | null;
  rider: RiderDetails;
  payment: Payment;
}

export interface BookingState {
  step: Step;
  draft: Draft;
  /** The booking just created, shown on the confirmation screen. */
  booking: Booking | null;
  /** Past and upcoming bookings, newest first. */
  history: Booking[];
}

export const emptyRider: RiderDetails = { mode: "self", name: "", phone: "", note: "", notify: true };

export const emptyDraft: Draft = {
  pickupId: null,
  destinationId: null,
  timing: "now",
  scheduledAt: null,
  vehicleId: null,
  rider: emptyRider,
  payment: "cash",
};

export const initialState: BookingState = { step: "trip", draft: emptyDraft, booking: null, history: [] };

export type Action =
  | { type: "hydrate"; state: BookingState }
  | { type: "setPickup"; id: string | null }
  | { type: "setDestination"; id: string | null }
  | { type: "swapPlaces" }
  | { type: "setTiming"; timing: TimingMode }
  | { type: "setScheduledAt"; at: string | null }
  | { type: "selectVehicle"; id: VehicleId | null }
  | { type: "updateRider"; patch: Partial<RiderDetails> }
  | { type: "setPayment"; payment: Payment }
  | { type: "goTo"; step: Step }
  | { type: "bookingCreated"; booking: Booking }
  | { type: "bookingUpdated"; booking: Booking }
  | { type: "cancelBooking"; ref: string }
  | { type: "startOver" };

const withDraft = (state: BookingState, patch: Partial<Draft>): BookingState => ({
  ...state,
  draft: { ...state.draft, ...patch },
});

const upsert = (history: Booking[], b: Booking) => [b, ...history.filter((h) => h.ref !== b.ref)].slice(0, 20);

export function bookingReducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    // Changing the trip can change which cars are available, so the car choice is cleared.
    case "setPickup":
      return withDraft(state, { pickupId: action.id, vehicleId: null });
    case "setDestination":
      return withDraft(state, { destinationId: action.id, vehicleId: null });
    case "swapPlaces":
      return withDraft(state, { pickupId: state.draft.destinationId, destinationId: state.draft.pickupId, vehicleId: null });
    case "setTiming":
      return withDraft(state, { timing: action.timing, vehicleId: null });
    case "setScheduledAt":
      return withDraft(state, { scheduledAt: action.at, vehicleId: null });
    case "selectVehicle":
      return withDraft(state, { vehicleId: action.id });
    case "updateRider":
      return withDraft(state, { rider: { ...state.draft.rider, ...action.patch } });
    case "setPayment":
      return withDraft(state, { payment: action.payment });
    case "goTo":
      return { ...state, step: action.step };
    case "bookingCreated":
      return { ...state, step: "confirmed", booking: action.booking, history: upsert(state.history, action.booking) };
    case "bookingUpdated":
      return {
        ...state,
        booking: state.booking?.ref === action.booking.ref ? action.booking : state.booking,
        history: upsert(state.history, action.booking),
      };
    case "cancelBooking":
      return {
        ...state,
        step: state.booking?.ref === action.ref ? "trip" : state.step,
        booking: state.booking?.ref === action.ref ? null : state.booking,
        history: state.history.filter((h) => h.ref !== action.ref),
      };
    case "startOver":
      return { ...initialState, history: state.history };
  }
}
