import { apiRequest } from "@/lib/api/client";
import type { AdminDashboardData } from "@/types";

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null; }
function hasNumericFields(value: unknown, fields: string[]) { return isRecord(value) && fields.every((field) => typeof value[field] === "number"); }

export function assertAdminDashboardData(value: unknown): asserts value is AdminDashboardData {
  if (!isRecord(value) || !hasNumericFields(value.capacity, ["totalCapacity", "available", "reserved", "occupied"]) || !hasNumericFields(value.counts, ["booked", "parked", "completed", "completedToday", "cancelled", "expired"]) || !Array.isArray(value.reservations) || !Array.isArray(value.activity) || !(value.device === null || isRecord(value.device))) {
    throw new Error("The admin API returned an outdated dashboard contract. Restart the backend and try again.");
  }
}

export async function getAdminDashboard() {
  const data = await apiRequest<unknown>("/api/admin/dashboard");
  assertAdminDashboardData(data);
  return data;
}
export const expireReservation = (id: string) => apiRequest<void>(`/api/admin/reservations/${id}/expire`, { method: "POST" });
