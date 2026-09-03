import type { Request, Response } from "express";
import { z } from "zod";
import { cancelReservation, createReservation, getReservationForUser, listUserReservations } from "../services/reservation.service.js";

const createSchema = z.object({ slotId: z.string().min(1), bookingDate: z.iso.date(), startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), durationMinutes: z.number().int().min(30).max(240), vehicleNumber: z.string().trim().min(4).max(30) });
export async function create(req: Request, res: Response) { res.status(201).json({ data: await createReservation(req.profile!, createSchema.parse(req.body)) }); }
export async function mine(req: Request, res: Response) { res.json({ data: await listUserReservations(req.auth!.uid) }); }
export async function one(req: Request, res: Response) { res.json({ data: await getReservationForUser(String(req.params.id), req.auth!.uid) }); }
export async function cancel(req: Request, res: Response) { res.json({ data: await cancelReservation(String(req.params.id), req.auth!.uid) }); }
