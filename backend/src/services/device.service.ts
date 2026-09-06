import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase.js";
import { env } from "../config/env.js";
import type { DeviceCommand, DeviceCommandStatus, DeviceEventInput, Reservation } from "../types/index.js";
import { assertAuthorizationState, assertCommandActive, assertParkingState, assertVacancyState, isReusableParkCommand, nextCommandStatus, parkCommandId } from "../utils/device-state.js";
import { HttpError } from "../utils/http-error.js";
import { isWithinVerificationWindow } from "../utils/reservation-time.js";
import { serializeDocument } from "../utils/serialize.js";

const commands = db.collection("deviceCommands");
const events = db.collection("deviceEvents");

export async function authorizeParking(token: string, userId: string) {
  const reservationQuery = await db.collection("reservations").where("qrToken", "==", token).limit(1).get();
  if (reservationQuery.empty) throw new HttpError(404, "Reservation QR token is invalid", "INVALID_TOKEN");
  const reservationRef = reservationQuery.docs[0]!.ref;
  const commandRef = commands.doc(parkCommandId(reservationRef.id));
  const activityRef = db.collection("activityLogs").doc();
  let reused = false;
  await db.runTransaction(async (transaction) => {
    const reservation = await transaction.get(reservationRef);
    const data = reservation.data()!;
    const slotRef = db.collection("parkingSlots").doc(data.slotId);
    const [slot, existingCommand] = await Promise.all([transaction.get(slotRef), transaction.get(commandRef)]);
    if (!slot.exists) throw new HttpError(404, "Parking slot not found", "SLOT_NOT_FOUND");
    assertAuthorizationState({ requestingUserId: userId, reservationUserId: data.userId, reservationStatus: data.status, withinWindow: isWithinVerificationWindow(data.bookingDate, data.startTime, data.durationMinutes), reservationId: reservation.id, reservationSlotId: data.slotId, slotId: slot.id, slotStatus: slot.get("status"), currentReservationId: slot.get("currentReservationId") });
    if (existingCommand.exists) {
      const command = existingCommand.data()!;
      const active = isReusableParkCommand(command.status, command.expiresAt.toDate());
      if (active) { reused = true; return; }
    }
    transaction.set(commandRef, { id: commandRef.id, deviceId: env.IOT_DEVICE_ID, type: "PARK", reservationId: reservation.id, slotId: slot.id, status: "PENDING", createdAt: FieldValue.serverTimestamp(), expiresAt: Timestamp.fromMillis(Date.now() + env.IOT_COMMAND_TTL_SECONDS * 1000), acknowledgedAt: null, completedAt: null, failureReason: null });
    transaction.create(activityRef, { type: "QR_AUTHORIZED", userId, reservationId: reservation.id, slotId: slot.id, message: `Parking entry authorized for reservation ${reservation.id}`, createdAt: FieldValue.serverTimestamp() });
  });
  const command = await commandRef.get();
  const value = serializeDocument<DeviceCommand>(command as FirebaseFirestore.QueryDocumentSnapshot);
  return { valid: true as const, reservationId: value.reservationId, slotId: value.slotId, slotNumber: reservationQuery.docs[0]!.get("slotNumber") as number, status: reservationQuery.docs[0]!.get("status") as Reservation["status"], command: { commandId: value.id, type: value.type, slotId: value.slotId, reservationId: value.reservationId, status: value.status, expiresAt: value.expiresAt }, reused };
}

export async function getNextCommand(deviceId: string) {
  const snapshot = await commands.where("deviceId", "==", deviceId).get();
  const pending = snapshot.docs.filter((doc) => doc.get("status") === "PENDING").sort((a, b) => (a.get("createdAt")?.toMillis?.() ?? 0) - (b.get("createdAt")?.toMillis?.() ?? 0));
  for (const command of pending) {
    if (command.get("expiresAt").toDate() <= new Date()) { await command.ref.update({ status: "EXPIRED" }); continue; }
    const value = serializeDocument<DeviceCommand>(command);
    return { commandId: value.id, type: value.type, slotId: value.slotId, reservationId: value.reservationId, expiresAt: value.expiresAt };
  }
  return null;
}

export async function processDeviceEvent(deviceId: string, input: DeviceEventInput) {
  const eventRef = events.doc(input.eventId);
  const commandRef = commands.doc(input.commandId);
  const activityRef = db.collection("activityLogs").doc();
  let duplicate = false;
  let activity: { type: string; reservationId: string; slotId: string; message: string } | undefined;
  await db.runTransaction(async (transaction) => {
    const priorEvent = await transaction.get(eventRef);
    if (priorEvent.exists) { duplicate = true; return; }
    const command = await transaction.get(commandRef);
    if (!command.exists) throw new HttpError(404, "Device command not found", "COMMAND_NOT_FOUND");
    const commandData = command.data()!;
    if (commandData.deviceId !== deviceId) throw new HttpError(403, "Command belongs to another device", "DEVICE_FORBIDDEN");
    if (commandData.slotId !== input.slotId) throw new HttpError(409, "Command and event slot do not match", "SLOT_MISMATCH");

    if (["COMMAND_ACKNOWLEDGED", "GATE_OPENED", "GATE_FAILED"].includes(input.type)) {
      assertCommandActive(commandData.status as DeviceCommandStatus, commandData.expiresAt.toDate());
      const status = nextCommandStatus(commandData.status as DeviceCommandStatus, input.type as "COMMAND_ACKNOWLEDGED" | "GATE_OPENED" | "GATE_FAILED");
      const update: Record<string, unknown> = { status };
      if (input.type === "COMMAND_ACKNOWLEDGED") update.acknowledgedAt = FieldValue.serverTimestamp();
      if (input.type === "GATE_OPENED") update.completedAt = FieldValue.serverTimestamp();
      if (input.type === "GATE_FAILED") update.failureReason = input.failureReason ?? "UNSPECIFIED";
      transaction.update(commandRef, update);
      if (input.type !== "COMMAND_ACKNOWLEDGED") activity = { type: input.type, reservationId: commandData.reservationId, slotId: commandData.slotId, message: input.type === "GATE_OPENED" ? `Gate opened for reservation ${commandData.reservationId}` : `Gate failed for reservation ${commandData.reservationId}` };
    } else {
      if (!["ACKNOWLEDGED", "COMPLETED"].includes(commandData.status)) throw new HttpError(409, "Parking command has not been acknowledged", "INVALID_COMMAND_STATE");
      const reservationRef = db.collection("reservations").doc(commandData.reservationId);
      const slotRef = db.collection("parkingSlots").doc(input.slotId);
      const [reservation, slot] = await Promise.all([transaction.get(reservationRef), transaction.get(slotRef)]);
      if (!reservation.exists || !slot.exists) throw new HttpError(404, "Reservation or parking slot not found", "STATE_NOT_FOUND");
      const state = { commandSlotId: commandData.slotId, eventSlotId: input.slotId, commandReservationId: commandData.reservationId, reservationSlotId: reservation.get("slotId") as string, reservationStatus: reservation.get("status") as Reservation["status"], slotStatus: slot.get("status"), currentReservationId: slot.get("currentReservationId") as string | null };
      if (input.type === "PARKING_CONFIRMED") {
        assertParkingState(state);
        transaction.update(slotRef, { status: "OCCUPIED", updatedAt: FieldValue.serverTimestamp() });
        activity = { type: "PARKING_CONFIRMED", reservationId: reservation.id, slotId: slot.id, message: `Parking confirmed for reservation ${reservation.id}` };
      } else {
        assertVacancyState(state);
        transaction.update(reservationRef, { status: "COMPLETED", updatedAt: FieldValue.serverTimestamp() });
        transaction.update(slotRef, { status: "AVAILABLE", currentReservationId: null, updatedAt: FieldValue.serverTimestamp() });
        activity = { type: "RESERVATION_COMPLETED", reservationId: reservation.id, slotId: slot.id, message: `Reservation ${reservation.id} completed after slot vacancy` };
      }
    }
    transaction.create(eventRef, { id: input.eventId, deviceId, type: input.type, commandId: input.commandId, reservationId: commandData.reservationId, slotId: input.slotId, createdAt: FieldValue.serverTimestamp() });
    if (activity) transaction.create(activityRef, { ...activity, userId: null, createdAt: FieldValue.serverTimestamp() });
  });
  return { accepted: true, duplicate };
}
