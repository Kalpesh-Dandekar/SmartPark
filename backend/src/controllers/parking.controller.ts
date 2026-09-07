import type { Request, Response } from "express";
import { z } from "zod";
import { getAvailability, getParkingStatus } from "../services/reservation.service.js";
const querySchema=z.object({date:z.iso.date(),startTime:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),durationMinutes:z.coerce.number().int().min(30).max(240)});
export async function availability(req:Request,res:Response){const input=querySchema.parse(req.query);res.json({data:await getAvailability(input.date,input.startTime,input.durationMinutes)})}
export async function status(_req:Request,res:Response){res.json({data:await getParkingStatus()})}
