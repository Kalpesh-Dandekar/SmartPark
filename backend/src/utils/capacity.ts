import type { StoredReservationStatus } from "../types/index.js";

export const TOTAL_PARKING_CAPACITY = 4;
export const CAPACITY_STATUSES: StoredReservationStatus[] = ["BOOKED", "PARKED", "ACTIVE"];

export interface CapacityRecord { status: StoredReservationStatus; startAt: Date; endAt: Date }
export function intervalsOverlap(startA: Date, endA: Date, startB: Date, endB: Date) { return startA < endB && endA > startB; }
export function consumesCapacity(status: StoredReservationStatus) { return CAPACITY_STATUSES.includes(status); }
export function calculateAvailability(records: CapacityRecord[], requestedStart: Date, requestedEnd: Date) {
  const overlapping = records.filter((record) => consumesCapacity(record.status) && intervalsOverlap(record.startAt, record.endAt, requestedStart, requestedEnd));
  const reserved = overlapping.filter((record) => record.status === "BOOKED" || record.status === "ACTIVE").length;
  const occupied = overlapping.filter((record) => record.status === "PARKED").length;
  return { totalCapacity: TOTAL_PARKING_CAPACITY, reserved, occupied, available: Math.max(0, TOTAL_PARKING_CAPACITY - reserved - occupied) };
}
