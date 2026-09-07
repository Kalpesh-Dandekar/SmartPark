import { apiRequest } from "@/lib/api/client";
import type { ApiReservation, QRVerificationResult } from "@/types";
export const verifyQr = (token: string) => apiRequest<QRVerificationResult>(`/api/qr/verify/${encodeURIComponent(token)}`);
export const confirmParking = (token: string) => apiRequest<ApiReservation>(`/api/qr/confirm-parking/${encodeURIComponent(token)}`, { method: "POST" });
