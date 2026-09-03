import type { Request, Response } from "express";
import { getSlot, listSlots } from "../services/slot.service.js";
export async function allSlots(_req: Request, res: Response) { res.json({ data: await listSlots() }); }
export async function slotById(req: Request, res: Response) { res.json({ data: await getSlot(String(req.params.id)) }); }
