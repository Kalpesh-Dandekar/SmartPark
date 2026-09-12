import type { Request, Response } from "express";
import { db } from "../config/firebase.js";
import { expireReservation } from "../services/reservation.service.js";
import { verifyArrival } from "../services/arrival.service.js";
import { serializeDocument } from "../utils/serialize.js";
import { getParkingStatus } from "../services/reservation.service.js";
import { countReservationStatuses, isAdminActivity, normalizeAdminReservation, sanitizeAdminActivity } from "../utils/admin-dashboard.js";
import type { ActivityLog, Reservation, StoredReservationStatus } from "../types/index.js";

export async function dashboard(_req: Request, res: Response) {
  const [capacity, reservationsSnap, activitySnap, deviceEventSnap] = await Promise.all([
    getParkingStatus(),
    db.collection("reservations").get(),
    db.collection("activityLogs").orderBy("createdAt", "desc").limit(20).get(),
    db.collection("deviceEvents").orderBy("createdAt", "desc").limit(1).get(),
  ]);
  const reservations = reservationsSnap.docs.map((doc) => serializeDocument<Omit<Reservation, "status" | "startAt" | "endAt" | "bookedAt"> & { status: StoredReservationStatus; startAt?: string; endAt?: string; bookedAt?: string }>(doc));
  const latestDeviceEvent = deviceEventSnap.empty ? null : serializeDocument<Record<string, unknown>>(deviceEventSnap.docs[0]!);
  res.json({ data: {
    capacity,
    reservations: reservations.map(normalizeAdminReservation),
    activity: activitySnap.docs.map((doc) => serializeDocument<ActivityLog>(doc)).filter(isAdminActivity).map(sanitizeAdminActivity),
    counts: countReservationStatuses(reservations),
    device: latestDeviceEvent ? { deviceId: latestDeviceEvent.deviceId, lastActivityAt: latestDeviceEvent.createdAt, lastEventType: latestDeviceEvent.type } : null,
  } });
}
export async function expire(req: Request, res: Response) { await expireReservation(String(req.params.id)); res.status(204).send(); }
export async function verifyReservationArrival(req: Request, res: Response) {
  res.json({ data: await verifyArrival(String(req.params.id), req.auth!.uid) });
}
