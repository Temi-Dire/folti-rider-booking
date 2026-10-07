# Folti Rider: booking experience

**Live:** https://folti-rider-booking.vercel.app

A mobile-first web app for booking a ride in Lagos: pick a pickup and destination, ride now or schedule for later, choose a car, book for yourself or someone else, review, and confirm.

Everything behind the screens (cars, prices, availability, drivers) is simulated in the browser. There is no backend, no paid service and no API key.

## Run it

Requires [Bun](https://bun.sh) 1.3+ (or Node 20+ with npm).

```bash
bun install
bun run dev        # http://localhost:3000
```

Other scripts:

```bash
bun run test       # unit tests for pricing, availability, scheduling and validation
bun run lint
bun run build && bun run start
```

With npm, replace `bun` with `npm` (`npm install`, `npm run dev`).

## Try every state

| State | How to see it |
|---|---|
| Loading | Every car search and booking has a short simulated delay. Add `?demo=slow` to make it 3x longer. |
| Available vehicles | Any trip from a central area (Yaba, VI, Lekki, Ikeja…). |
| Unavailable vehicle | Schedule a pickup between 6 and 9 AM: XL shows "Fully booked". Between midnight and 5 AM, Premium is off. |
| No available vehicles | Pick **Epe**, **Ikorodu**, **Festac** or **Magodo** as pickup with **Now**. Or add `?demo=no-vehicles`. |
| Invalid / incomplete form | Press "Choose a car" with no places, or "Review booking" with an empty or wrong phone number. |
| Booking failed + retry | Add `?demo=booking-fails`. The first attempt fails, "Try again" works. |
| Scheduled booking | Toggle **Schedule**, pick a day and time. Purple marks every scheduled ride. |
| Booking for someone else | On "Who's riding?" pick **Someone else**. The ticket and confirmation show "Riding" and "Booked by" separately. |
| Booking confirmation / created | Review ticket, then the confirmation screen with a booking reference. Ride-now bookings simulate finding and assigning a driver. |

Flags can be combined: `?demo=slow,booking-fails`.

## Technologies

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** with design tokens in `src/app/globals.css`
- **Leaflet** + **react-leaflet** for the map
- **lucide-react** icons
- **Vitest** for unit tests

## External services

- **OpenStreetMap tiles** (`tile.openstreetmap.org`): free, no key. Shown in night mode with a CSS filter. Attribution is on the map. If tiles fail to load, the app still works on a plain dark background.
- **Google Fonts** via `next/font` (Unbounded, Onest), downloaded at build time.

Nothing else. No account, key or paid plan is needed to run or review it.

## How it's built

```
src/
  app/                 layout, page, global styles and tokens
  components/
    booking/           one component per step (TripStep, VehicleStep, RiderStep, ReviewStep, ConfirmedView),
                       plus PlacePicker, SchedulePicker, VehicleCard, TripTicket, TripsList, BookingApp (layout)
    map/TripMap.tsx    Leaflet map: pins, curved route, simulated nearby cars
    ui/                Button, SegmentedControl, TextField, Toggle, Notice, Badge
    vehicle/           car illustrations
  hooks/               useQuote (load cars for a trip), useNow (ticking clock)
  lib/                 pure logic, no React:
                       places, vehicles, pricing, availability, schedule, validation, format,
                       bookingService (the fake backend), demo flags
  state/               bookingReducer, BookingProvider (context), persistence (localStorage)
```

- **UI and logic are separate.** Pricing, availability, scheduling rules and validation are plain functions in `src/lib`, unit-tested in `src/lib/__tests__`. Components only render and dispatch.
- **One reducer holds the booking.** A single `useReducer` + context in `src/state`. The flow is small, so a state library would be overkill. Changing the trip (places, time) clears the chosen car, since availability and price depend on it.
- **The fake backend is one file.** `bookingService.ts` exposes async `fetchQuote`, `createBooking` and `assignDriver` with delays. Replacing it with real API calls wouldn't touch the components.
- **Availability is deterministic.** The same trip and time always give the same result, so every state can be reproduced by a reviewer.
- **Refresh-safe.** The draft and booked trips are saved to `localStorage`. On reload, a scheduled time that has passed is cleared, and the app never resumes mid-flow with an invalid trip.

## Product decisions

- **Step by step, not one long form.** Trip → Car → Rider → Review → Confirmed, one decision per screen, like Bolt or Uber. On phones the steps live in a bottom sheet over the map. On desktop the panel sits on the left, and a live trip ticket appears on the right while choosing a car and rider.
- **Scheduled rides look different everywhere.** A purple "Scheduled" band or badge appears on the car list, ticket, confirmation and trip history. Ride-now uses green.
- **Booker vs rider is explicit.** The rider step says "You're booking as Tolu Bakare". The ticket has separate **Riding** and **Booked by** lines, with the rider's name highlighted. The confirmation title says "Booked for Funke".
- **Prices are estimates.** Fare = base + per km + per minute, times a car multiplier and a busy-hours surcharge (weekdays 7 to 10 AM, 5 to 8 PM), rounded to ₦50. Distance is straight line × 1.35 to account for Lagos roads.
- **The first available car is pre-selected,** so a rider in a hurry can continue in one tap.
- **Payment is shown but not processed:** Cash (default) or a demo card.

## Assumptions

- **Signed-in user:** there's no login. The booker is a mock signed-in rider, "Tolu Bakare" (`src/lib/user.ts`).
- **Places:** 16 Lagos areas with approximate coordinates instead of street-level search. Four outer areas are "low coverage" to demonstrate the no-cars state.
- **Phone numbers:** booking for someone else accepts Nigerian mobile numbers only (070, 080, 081, 090, 091…), in any common format (0803…, +234…, 234…). They're stored as +234.
- **Scheduling:** pickups from 30 minutes to 30 days ahead, in 15-minute slots. Times use the device's clock and timezone. In Lagos that's WAT.
- **Drivers:** for ride-now, a driver is "assigned" about 3 seconds after booking. For scheduled rides, the confirmation says a driver is assigned 30 minutes before pickup.
- **Cancellation:** removes the booking locally. The free-cancellation windows shown (2 minutes for ride-now, until 1 hour before for scheduled) are illustrative.
- **Vehicle images:** simple SVG illustrations instead of photos, to avoid licensing issues and keep the app light.
- **Route line:** a curve between the two points, not real road routing, which would need a routing service.
