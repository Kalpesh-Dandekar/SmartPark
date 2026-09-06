import { apiRequest } from "@/lib/api/client";
import type { QRParkingAuthorization, QRVerificationResult } from "@/types";
export const verifyQr = (token: string) => apiRequest<QRVerificationResult>(`/api/qr/verify/${encodeURIComponent(token)}`);
export const authorizeQr = (token: string) => apiRequest<QRParkingAuthorization>(`/api/qr/authorize/${encodeURIComponent(token)}`, { method: "POST" });
