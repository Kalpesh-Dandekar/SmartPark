import type { StoredReservationStatus } from "../types/index.js";

export function isBookedForArrival(status: StoredReservationStatus) {
  return status === "BOOKED" || status === "ACTIVE";
}

export function requiresParkingDetection(arrivalFlowVersion: unknown, arrivalState: unknown) {
  return arrivalFlowVersion === 1 || typeof arrivalState === "string";
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
