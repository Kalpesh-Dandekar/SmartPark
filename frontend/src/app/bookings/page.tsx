import type { Metadata } from "next";

import { BookingsView } from "@/features/booking/bookings-view";

export const metadata: Metadata = { title: "My Bookings | SmartPark" };

export default function BookingsPage() {
  return <BookingsView />;
}
