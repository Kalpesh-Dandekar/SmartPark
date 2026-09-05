import type { Request, Response } from "express";
import { db } from "../config/firebase.js";
import { expireReservation } from "../services/reservation.service.js";
import { listSlots } from "../services/slot.service.js";
import { serializeDocument } from "../utils/serialize.js";
import type { ActivityLog, Reservation } from "../types/index.js";

export async function dashboard(_req: Request, res: Response) {
  const [slots, reservationsSnap, activitySnap] = await Promise.all([listSlots(), db.collection("reservations").get(), db.collection("activityLogs").orderBy("createdAt", "desc").limit(20).get()]);
  const reservations = reservationsSnap.docs.map((doc) => serializeDocument<Reservation>(doc));
  const safeReservations = reservations.map(({ qrToken, ...reservation }) => { void qrToken; return reservation; });
  res.json({ data: { slots, reservations: safeReservations, activity: activitySnap.docs.map((doc) => serializeDocument<ActivityLog>(doc)), summary: { total: slots.length, available: slots.filter((s) => s.status === "AVAILABLE").length, reserved: slots.filter((s) => s.status === "RESERVED").length, occupied: slots.filter((s) => s.status === "OCCUPIED").length, activeReservations: reservations.filter((r) => r.status === "ACTIVE").length, cancelledReservations: reservations.filter((r) => r.status === "CANCELLED").length, expiredReservations: reservations.filter((r) => r.status === "EXPIRED").length } } });
}
export async function expire(req: Request, res: Response) { await expireReservation(String(req.params.id)); res.status(204).send(); }
