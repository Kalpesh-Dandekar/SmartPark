import { apiRequest } from "@/lib/api/client";
import type { QRVerificationResult } from "@/types";
export const verifyQr = (token: string) => apiRequest<QRVerificationResult>(`/api/qr/verify/${encodeURIComponent(token)}`);
