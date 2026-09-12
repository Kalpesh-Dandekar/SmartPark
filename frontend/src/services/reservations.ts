import { apiRequest } from "@/lib/api/client";
import type { ApiReservation } from "@/types";
export const getMyReservations = () => apiRequest<ApiReservation[]>("/api/reservations/me");
export const createReservation = (input: { bookingDate: string; startTime: string; durationMinutes: number; vehicleNumber: string }) => apiRequest<ApiReservation>("/api/reservations", { method: "POST", body: JSON.stringify(input) });
export const cancelReservation = (id: string) => apiRequest<ApiReservation>(`/api/reservations/${id}/cancel`, { method: "PATCH" });
export const checkoutReservation = (id: string) => apiRequest<ApiReservation>(`/api/reservations/${id}/checkout`, { method: "PATCH" });
export const confirmReservationParking = (id: string) => apiRequest<ApiReservation>(`/api/reservations/${id}/confirm-parking`, { method: "POST" });
