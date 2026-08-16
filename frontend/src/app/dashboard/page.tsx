import type { Metadata } from "next";

import { DashboardView } from "@/features/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard | SmartPark",
  description: "View current parking availability and your upcoming reservation.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
