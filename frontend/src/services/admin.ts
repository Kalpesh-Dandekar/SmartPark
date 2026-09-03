import { apiRequest } from "@/lib/api/client";
import type { AdminDashboardData } from "@/types";
export const getAdminDashboard = () => apiRequest<AdminDashboardData>("/api/admin/dashboard");
export const expireReservation = (id: string) => apiRequest<void>(`/api/admin/reservations/${id}/expire`, { method: "POST" });
