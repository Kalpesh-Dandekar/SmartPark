import type { Request, Response } from "express";
import { logActivity } from "../services/activity.service.js";
import { verifyQrToken } from "../services/reservation.service.js";
export async function verify(req: Request, res: Response) { const result = await verifyQrToken(String(req.params.token)); await logActivity({ type: result.valid ? "QR_VERIFIED" : "QR_VERIFICATION_FAILED", reservationId: result.reservationId, slotId: result.slotId, message: result.valid ? `QR verified for ${result.reservationId}` : `QR verification failed: ${result.reason}` }); res.status(result.valid ? 200 : 400).json({ data: result }); }
