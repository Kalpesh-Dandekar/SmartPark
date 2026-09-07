import type { Request, Response } from "express";
import { logActivity } from "../services/activity.service.js";
import { confirmParking, verifyQrToken } from "../services/reservation.service.js";
export async function verify(req: Request, res: Response) { const result = await verifyQrToken(String(req.params.token),req.auth!.uid); await logActivity({ type: result.valid ? "QR_VERIFIED" : "QR_VERIFICATION_FAILED", userId:req.auth!.uid,reservationId: result.reservationId, message: result.valid ? `QR verified for ${result.reservationId}` : `QR verification failed: ${result.reason}` }); res.status(result.valid ? 200 : 400).json({ data: result }); }
export async function confirm(req:Request,res:Response){res.json({data:await confirmParking(String(req.params.token),req.auth!.uid)})}
