import type { Request, Response } from "express";
import { z } from "zod";
import { createUserProfile } from "../services/auth.service.js";
import { logActivity } from "../services/activity.service.js";

const profileSchema = z.object({ name: z.string().trim().min(2).max(100), vehicleNumber: z.string().trim().min(4).max(30).optional() });
export async function registerProfile(req: Request, res: Response) { const input = profileSchema.parse(req.body); const profile = await createUserProfile({ uid: req.auth!.uid, email: req.auth!.email!, ...input }); res.status(201).json({ data: profile }); }
export async function currentProfile(req: Request, res: Response) { res.json({ data: req.profile }); }
export async function recordLogin(req: Request, res: Response) { await logActivity({ type: "USER_LOGGED_IN", userId: req.auth!.uid, message: `User logged in: ${req.profile!.email}` }); res.status(204).send(); }
