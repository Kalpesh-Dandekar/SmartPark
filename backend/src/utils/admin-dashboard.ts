import type { ActivityLog, Reservation, StoredReservationStatus } from "../types/index.js";
import { reservationStart } from "./reservation-time.js";

export type AdminReservation = Omit<Reservation, "qrToken" | "slotId" | "slotNumber" | "startAt" | "endAt" | "bookedAt"> & Partial<Pick<Reservation, "startAt" | "endAt" | "bookedAt">>;
type StoredAdminReservation = Omit<Reservation, "status" | "startAt" | "endAt" | "bookedAt"> & { status: StoredReservationStatus; startAt?: string; endAt?: string; bookedAt?: string };

function validTimestamp(value: unknown) { return typeof value === "string" && !Number.isNaN(new Date(value).getTime()) ? new Date(value) : null; }

export function normalizeAdminReservation(reservation: StoredAdminReservation): AdminReservation {
  const { qrToken: _qrToken, slotId: _slotId, slotNumber: _slotNumber, ...safe } = reservation;
  void _qrToken;
  void _slotId;
  void _slotNumber;
  let start = validTimestamp(safe.startAt);
  if (!start) {
    try { start = reservationStart(safe.bookingDate, safe.startTime); } catch { start = null; }
  }
  const end = validTimestamp(safe.endAt) ?? (start && Number.isFinite(safe.durationMinutes) ? new Date(start.getTime() + safe.durationMinutes * 60_000) : null);
  return { ...safe, startAt: start?.toISOString(), endAt: end?.toISOString(), bookedAt: validTimestamp(safe.bookedAt)?.toISOString() ?? validTimestamp(safe.createdAt)?.toISOString(), status: safe.status === "ACTIVE" ? "BOOKED" : safe.status } as AdminReservation;
}

export function sanitizeAdminActivity(activity: ActivityLog): Omit<ActivityLog, "slotId"> {
  const { slotId: _slotId, ...safe } = activity;
  void _slotId;
  return safe;
}

export const ADMIN_ACTIVITY_TYPES = ["RESERVATION_CREATED", "PARKING_CONFIRMED", "RESERVATION_COMPLETED", "RESERVATION_CANCELLED", "RESERVATION_EXPIRED"];
export function isAdminActivity(activity: ActivityLog) { return ADMIN_ACTIVITY_TYPES.includes(activity.type); }

export function countReservationStatuses(reservations: Array<{ status: StoredReservationStatus; completedAt?: string }>, now = new Date()) {
  const normalized = reservations.map((reservation) => reservation.status === "ACTIVE" ? "BOOKED" : reservation.status);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
  return {
    booked: normalized.filter((status) => status === "BOOKED").length,
    parked: normalized.filter((status) => status === "PARKED").length,
    completed: normalized.filter((status) => status === "COMPLETED").length,
    completedToday: reservations.filter((reservation) => reservation.status === "COMPLETED" && reservation.completedAt && new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(reservation.completedAt)) === today).length,
    cancelled: normalized.filter((status) => status === "CANCELLED").length,
    expired: normalized.filter((status) => status === "EXPIRED").length,
  };
}

export function canAdminExpire(status: StoredReservationStatus) {
  return status === "BOOKED" || status === "ACTIVE";
}

export function hasAdminDashboardContract(value: unknown) {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  const capacity = data.capacity as Record<string, unknown> | undefined;
  const counts = data.counts as Record<string, unknown> | undefined;
  return Boolean(capacity && counts && ["totalCapacity", "available", "reserved", "occupied"].every((key) => typeof capacity[key] === "number") && ["booked", "parked", "completed", "completedToday", "cancelled", "expired"].every((key) => typeof counts[key] === "number") && Array.isArray(data.reservations) && Array.isArray(data.activity) && "device" in data);
}
