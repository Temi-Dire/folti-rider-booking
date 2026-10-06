import { BookingApp } from "@/components/booking/BookingApp";
import { BookingProvider } from "@/state/BookingProvider";

export default function Home() {
  return (
    <BookingProvider>
      <BookingApp />
    </BookingProvider>
  );
}
