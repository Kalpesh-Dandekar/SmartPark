import type { StoredReservationStatus } from "../types/index.js";

export function isBookedForArrival(status: StoredReservationStatus) {
  return status === "BOOKED" || status === "ACTIVE";
}

export function requiresParkingDetection(arrivalFlowVersion: unknown, arrivalState: unknown) {
  return arrivalFlowVersion === 1 || typeof arrivalState === "string";
}

export function parkingConfirmationDecision(input: {
  ownerId: string;
  requesterId: string;
  status: StoredReservationStatus;
  arrivalFlowVersion?: unknown;
  arrivalState?: unknown;
}) {
  if (input.ownerId !== input.requesterId) return "FORBIDDEN" as const;
  if (input.status === "PARKED") return "IDEMPOTENT" as const;
  if (!isBookedForArrival(input.status)) return "INVALID_STATUS" as const;
  if (requiresParkingDetection(input.arrivalFlowVersion, input.arrivalState) && input.arrivalState !== "PARKING_DETECTED") return "PARKING_NOT_DETECTED" as const;
  return "CONFIRM" as const;
}

export function parkingConfirmationUpdate(timestamp: unknown) {
  return { status: "PARKED" as const, arrivalState: "CONFIRMED" as const, parkedAt: timestamp, updatedAt: timestamp };
}

export function canAssociateParkingDetection(input: {
  reservationExists: boolean;
  reservationStatus?: StoredReservationStatus;
  reservationArrivalState?: unknown;
  activeState?: unknown;
  expiresAtMs?: number;
}, nowMs = Date.now()) {
  return input.reservationExists && input.reservationStatus !== undefined &&
    isBookedForArrival(input.reservationStatus) && input.reservationArrivalState === "AWAITING_HARDWARE" &&
    input.activeState === "AWAITING_HARDWARE" && typeof input.expiresAtMs === "number" && input.expiresAtMs > nowMs;
}
