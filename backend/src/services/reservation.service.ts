import { randomUUID } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../config/firebase.js";
import type { Reservation, UserProfile } from "../types/index.js";
import { HttpError } from "../utils/http-error.js";
import { serializeDocument } from "../utils/serialize.js";
import { assertFutureReservation, isWithinVerificationWindow, reservationStart, GRACE_PERIOD_MINUTES } from "../utils/reservation-time.js";
import { logActivity } from "./activity.service.js";

interface CreateReservationInput { slotId: string; bookingDate: string; startTime: string; durationMinutes: number; vehicleNumber: string }

export async function createReservation(user: UserProfile, input: CreateReservationInput): Promise<Reservation> {
  assertFutureReservation(input.bookingDate, input.startTime);
  const slotRef = db.collection("parkingSlots").doc(input.slotId);
  const reservationRef = db.collection("reservations").doc();
  const qrToken = randomUUID();
  await db.runTransaction(async (transaction) => {
    const slot = await transaction.get(slotRef);
    if (!slot.exists) throw new HttpError(404, "Parking slot not found", "SLOT_NOT_FOUND");
    const slotData = slot.data()!;
    if (!slotData.isActive) throw new HttpError(409, "Parking slot is inactive", "SLOT_INACTIVE");
    if (slotData.status !== "AVAILABLE" || slotData.currentReservationId) throw new HttpError(409, "Parking slot is no longer available", "SLOT_UNAVAILABLE");
    transaction.create(reservationRef, { id: reservationRef.id, userId: user.uid, userName: user.name, userEmail: user.email, vehicleNumber: input.vehicleNumber, slotId: slot.id, slotNumber: slotData.slotNumber, bookingDate: input.bookingDate, startTime: input.startTime, durationMinutes: input.durationMinutes, status: "ACTIVE", qrToken, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    transaction.update(slotRef, { status: "RESERVED", currentReservationId: reservationRef.id, updatedAt: FieldValue.serverTimestamp() });
  });
  await logActivity({ type: "RESERVATION_CREATED", userId: user.uid, reservationId: reservationRef.id, slotId: input.slotId, message: `Reservation ${reservationRef.id} created` });
  return getReservationForUser(reservationRef.id, user.uid);
}

export async function listUserReservations(userId: string) {
  const snapshot = await db.collection("reservations").where("userId", "==", userId).get();
  return snapshot.docs.map((doc) => serializeDocument<Reservation>(doc)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getReservationForUser(id: string, userId: string) {
  const snapshot = await db.collection("reservations").doc(id).get();
  if (!snapshot.exists) throw new HttpError(404, "Reservation not found", "RESERVATION_NOT_FOUND");
  const reservation = { id: snapshot.id, ...snapshot.data() } as Reservation;
  if (reservation.userId !== userId) throw new HttpError(403, "You cannot access this reservation", "FORBIDDEN");
  return serializeReservation(snapshot);
}

export async function cancelReservation(id: string, userId: string) {
  const reservationRef = db.collection("reservations").doc(id);
  let slotId = "";
  await db.runTransaction(async (transaction) => {
    const reservation = await transaction.get(reservationRef);
    if (!reservation.exists) throw new HttpError(404, "Reservation not found", "RESERVATION_NOT_FOUND");
    const data = reservation.data()!;
    if (data.userId !== userId) throw new HttpError(403, "You cannot cancel this reservation", "FORBIDDEN");
    if (data.status !== "ACTIVE") throw new HttpError(409, "Only active reservations can be cancelled", "INVALID_STATUS");
    slotId = data.slotId;
    const slotRef = db.collection("parkingSlots").doc(slotId);
    const slot = await transaction.get(slotRef);
    if (!slot.exists || slot.data()?.currentReservationId !== id) throw new HttpError(409, "Reservation and slot state do not match", "SLOT_MISMATCH");
    transaction.update(reservationRef, { status: "CANCELLED", updatedAt: FieldValue.serverTimestamp() });
    transaction.update(slotRef, { status: "AVAILABLE", currentReservationId: null, updatedAt: FieldValue.serverTimestamp() });
  });
  await logActivity({ type: "RESERVATION_CANCELLED", userId, reservationId: id, slotId, message: `Reservation ${id} cancelled` });
  return getReservationForUser(id, userId);
}

export async function expireReservation(id: string) {
  const reservationRef = db.collection("reservations").doc(id);
  let userId = ""; let slotId = "";
  await db.runTransaction(async (transaction) => {
    const reservation = await transaction.get(reservationRef);
    if (!reservation.exists) throw new HttpError(404, "Reservation not found", "RESERVATION_NOT_FOUND");
    const data = reservation.data()!; userId = data.userId; slotId = data.slotId;
    if (data.status !== "ACTIVE") throw new HttpError(409, "Only active reservations can expire", "INVALID_STATUS");
    const deadline = reservationStart(data.bookingDate, data.startTime).getTime() + GRACE_PERIOD_MINUTES * 60_000;
    if (Date.now() <= deadline) throw new HttpError(409, "Reservation grace period has not expired", "GRACE_ACTIVE");
    const slotRef = db.collection("parkingSlots").doc(slotId); const slot = await transaction.get(slotRef);
    if (!slot.exists || slot.data()?.currentReservationId !== id) throw new HttpError(409, "Reservation and slot state do not match", "SLOT_MISMATCH");
    transaction.update(reservationRef, { status: "EXPIRED", updatedAt: FieldValue.serverTimestamp() });
    transaction.update(slotRef, { status: "AVAILABLE", currentReservationId: null, updatedAt: FieldValue.serverTimestamp() });
  });
  await logActivity({ type: "RESERVATION_EXPIRED", userId, reservationId: id, slotId, message: `Reservation ${id} expired` });
}

export async function verifyQrToken(token: string) {
  const query = await db.collection("reservations").where("qrToken", "==", token).limit(1).get();
  if (query.empty) return { valid: false as const, reason: "INVALID_TOKEN" as const };
  const reservation = serializeDocument<Reservation>(query.docs[0]!);
  if (reservation.status === "CANCELLED") return { valid: false as const, reason: "CANCELLED" as const };
  if (reservation.status === "EXPIRED") return { valid: false as const, reason: "EXPIRED" as const };
  if (reservation.status !== "ACTIVE" || !isWithinVerificationWindow(reservation.bookingDate, reservation.startTime, reservation.durationMinutes)) return { valid: false as const, reason: "INVALID_TIME" as const };
  const slot = await db.collection("parkingSlots").doc(reservation.slotId).get();
  if (!slot.exists || slot.data()?.status !== "RESERVED" || slot.data()?.currentReservationId !== reservation.id) return { valid: false as const, reason: "SLOT_MISMATCH" as const };
  return { valid: true as const, reservationId: reservation.id, slotId: reservation.slotId, slotNumber: reservation.slotNumber, status: reservation.status };
}

function serializeReservation(snapshot: FirebaseFirestore.DocumentSnapshot): Reservation {
  const data = snapshot.data()!;
  return { id: snapshot.id, ...data, createdAt: data.createdAt?.toDate().toISOString(), updatedAt: data.updatedAt?.toDate().toISOString() } as Reservation;
}
