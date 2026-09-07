import type { Metadata } from "next";

import { BookSlotView } from "@/features/booking/book-slot-view";

export const metadata: Metadata = { title: "Book Parking | SmartPark" };

export default function BookPage() {
  return <BookSlotView />;
}
