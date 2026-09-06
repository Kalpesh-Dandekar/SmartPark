import type { DeviceCommandStatus, ReservationStatus, SlotStatus } from "../types/index.js";
import { HttpError } from "./http-error.js";

export function nextCommandStatus(current: DeviceCommandStatus, event: "COMMAND_ACKNOWLEDGED" | "GATE_OPENED" | "GATE_FAILED") {
  if (event === "COMMAND_ACKNOWLEDGED" && (current === "PENDING" || current === "ACKNOWLEDGED")) return "ACKNOWLEDGED" as const;
  if (event === "GATE_OPENED" && (current === "ACKNOWLEDGED" || current === "COMPLETED")) return "COMPLETED" as const;
  if (event === "GATE_FAILED" && (["PENDING", "ACKNOWLEDGED", "FAILED"] as DeviceCommandStatus[]).includes(current)) return "FAILED" as const;
  throw new HttpError(409, "Command is not in a valid state for this event", "INVALID_COMMAND_STATE");
}

export function assertCommandActive(status: DeviceCommandStatus, expiresAt: Date, now = new Date()) {
  if (["FAILED", "EXPIRED"].includes(status)) throw new HttpError(409, "Device command is not active", "COMMAND_INACTIVE");
  if (expiresAt <= now) throw new HttpError(409, "Device command has expired", "COMMAND_EXPIRED");
}

export function parkCommandId(reservationId: string) { return `park-${reservationId}`; }

export function isReusableParkCommand(status: DeviceCommandStatus, expiresAt: Date, now = new Date()) {
  return (["PENDING", "ACKNOWLEDGED", "COMPLETED"] as DeviceCommandStatus[]).includes(status) && expiresAt > now;
}

export function assertAuthorizationState(input: { requestingUserId: string; reservationUserId: string; reservationStatus: ReservationStatus; withinWindow: boolean; reservationId: string; reservationSlotId: string; slotId: string; slotStatus: SlotStatus; currentReservationId: string | null }) {
  if (input.requestingUserId !== input.reservationUserId) throw new HttpError(403, "This reservation belongs to another user", "FORBIDDEN");
  if (input.reservationStatus !== "ACTIVE") throw new HttpError(409, "Reservation is not active", "INVALID_RESERVATION_STATE");
  if (!input.withinWindow) throw new HttpError(409, "Reservation is outside the entry window", "INVALID_TIME");
  if (input.reservationSlotId !== input.slotId || input.slotStatus !== "RESERVED" || input.currentReservationId !== input.reservationId) throw new HttpError(409, "Reservation and slot state do not match", "SLOT_MISMATCH");
}

export function assertParkingState(input: { commandSlotId: string; eventSlotId: string; commandReservationId: string; reservationSlotId: string; reservationStatus: ReservationStatus; slotStatus: SlotStatus; currentReservationId: string | null }) {
  if (input.commandSlotId !== input.eventSlotId || input.reservationSlotId !== input.eventSlotId) throw new HttpError(409, "Command, reservation, and slot do not match", "SLOT_MISMATCH");
  if (input.reservationStatus !== "ACTIVE") throw new HttpError(409, "Reservation is not active", "INVALID_RESERVATION_STATE");
  if (input.slotStatus !== "RESERVED" || input.currentReservationId !== input.commandReservationId) throw new HttpError(409, "Slot is not reserved for this reservation", "SLOT_MISMATCH");
}

export function assertVacancyState(input: { commandSlotId: string; eventSlotId: string; commandReservationId: string; reservationSlotId: string; reservationStatus: ReservationStatus; slotStatus: SlotStatus; currentReservationId: string | null }) {
  if (input.commandSlotId !== input.eventSlotId || input.reservationSlotId !== input.eventSlotId) throw new HttpError(409, "Command, reservation, and slot do not match", "SLOT_MISMATCH");
  if (input.reservationStatus !== "ACTIVE") throw new HttpError(409, "Reservation is not active", "INVALID_RESERVATION_STATE");
  if (input.slotStatus !== "OCCUPIED" || input.currentReservationId !== input.commandReservationId) throw new HttpError(409, "Slot is not occupied for this reservation", "SLOT_MISMATCH");
}
