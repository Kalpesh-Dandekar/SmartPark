import type { Metadata } from "next";

import { AdminLateReservationsView } from "@/features/admin/admin-late-reservations-view";

export const metadata: Metadata = { title: "Late Reservations | SmartPark Admin" };

export default function AdminDashboardPage() {
  return <AdminLateReservationsView />;
}
