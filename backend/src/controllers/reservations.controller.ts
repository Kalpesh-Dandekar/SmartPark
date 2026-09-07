import type { Request, Response } from "express";
import { z } from "zod";
import { cancelReservation, checkoutReservation, createReservation, getReservationForUser, listUserReservations } from "../services/reservation.service.js";

export const reservationInputSchema = z.object({ bookingDate: z.iso.date(), startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), durationMinutes: z.coerce.number().int().min(30).max(240), vehicleNumber: z.string().trim().min(4).max(30) });
const createSchema = reservationInputSchema;
export async function create(req: Request, res: Response) { res.status(201).json({ data: await createReservation(req.profile!, createSchema.parse(req.body)) }); }
export async function mine(req: Request, res: Response) { res.json({ data: await listUserReservations(req.auth!.uid) }); }
export async function one(req: Request, res: Response) { res.json({ data: await getReservationForUser(String(req.params.id), req.auth!.uid) }); }
export async function cancel(req: Request, res: Response) { res.json({ data: await cancelReservation(String(req.params.id), req.auth!.uid) }); }
export async function checkout(req: Request, res: Response) { res.json({ data: await checkoutReservation(String(req.params.id), req.auth!.uid) }); }
