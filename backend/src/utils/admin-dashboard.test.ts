import assert from "node:assert/strict";
import test from "node:test";
import { canAdminExpire, countReservationStatuses, hasAdminDashboardContract, isAdminActivity, normalizeAdminReservation, sanitizeAdminActivity } from "./admin-dashboard.js";
import type { Reservation, StoredReservationStatus } from "../types/index.js";

const base = { id: "r1", userId: "u1", userName: "User", userEmail: "u@example.com", vehicleNumber: "MH01AA0001", bookingDate: "2030-01-01", startTime: "10:00", durationMinutes: 60, startAt: "2030-01-01T04:30:00.000Z", endAt: "2030-01-01T05:30:00.000Z", status: "BOOKED", qrToken: "secret-token", bookedAt: "2030-01-01T00:00:00.000Z", createdAt: "2030-01-01T00:00:00.000Z", updatedAt: "2030-01-01T00:00:00.000Z", slotId: "SLOT-1", slotNumber: 1 } satisfies Reservation;

test("admin reservations normalize legacy ACTIVE and hide QR and physical slot identity", () => {
  const result = normalizeAdminReservation({ ...base, status: "ACTIVE" } as Omit<Reservation, "status"> & { status: StoredReservationStatus });
  assert.equal(result.status, "BOOKED");
  assert.equal("qrToken" in result, false);
  assert.equal("slotId" in result, false);
  assert.equal("slotNumber" in result, false);
});

test("admin counts recognize all lifecycle states", () => {
  const result = countReservationStatuses(["BOOKED", "ACTIVE", "PARKED", "COMPLETED", "CANCELLED", "EXPIRED"].map((status) => ({ status: status as StoredReservationStatus })));
  assert.deepEqual({ booked: result.booked, parked: result.parked, completed: result.completed, cancelled: result.cancelled, expired: result.expired }, { booked: 2, parked: 1, completed: 1, cancelled: 1, expired: 1 });
});

test("only BOOKED and legacy ACTIVE reservations can be expired", () => {
  assert.equal(canAdminExpire("BOOKED"), true);
  assert.equal(canAdminExpire("ACTIVE"), true);
  for (const status of ["PARKED", "COMPLETED", "CANCELLED", "EXPIRED"] as const) assert.equal(canAdminExpire(status), false);
});

test("admin activity hides legacy physical slot identity", () => {
  const result = sanitizeAdminActivity({ id: "a1", type: "RESERVATION_CREATED", userId: "u1", reservationId: "r1", slotId: "SLOT-1", message: "Reservation created", createdAt: "2030-01-01T00:00:00.000Z" });
  assert.equal("slotId" in result, false);
});

test("admin activity presents reservation lifecycle events separately from device events", () => {
  assert.equal(isAdminActivity({ id: "a1", type: "PARKING_CONFIRMED", userId: "u1", reservationId: "r1", slotId: null, message: "Parking confirmed", createdAt: "" }), true);
  assert.equal(isAdminActivity({ id: "a2", type: "ARRIVAL_VERIFIED", userId: "u1", reservationId: "r1", slotId: null, message: "Arrival verified", createdAt: "" }), true);
  assert.equal(isAdminActivity({ id: "a3", type: "PARKING_DETECTED", userId: "u1", reservationId: "r1", slotId: null, message: "Parking detected", createdAt: "" }), true);
  assert.equal(isAdminActivity({ id: "a4", type: "GATE_OPENED", userId: null, reservationId: "r1", slotId: "SLOT-1", message: "Gate opened", createdAt: "" }), false);
});

test("admin reservation serialization preserves valid optional arrival state without requiring it", () => {
  const current = normalizeAdminReservation({ ...base, arrivalState: "PARKING_DETECTED", parkingDetectedAt: "2030-01-01T04:45:00.000Z" });
  const legacy = normalizeAdminReservation(base);
  assert.equal(current.arrivalState, "PARKING_DETECTED");
  assert.equal(current.parkingDetectedAt, "2030-01-01T04:45:00.000Z");
  assert.equal(legacy.arrivalState, undefined);
});

test("admin dashboard contract requires capacity, lifecycle counts, collections, and device state", () => {
  const canonical = { capacity: { totalCapacity: 4, available: 2, reserved: 1, occupied: 1 }, counts: { booked: 1, parked: 1, completed: 2, completedToday: 1, cancelled: 1, expired: 1 }, reservations: [], activity: [], device: null };
  assert.equal(hasAdminDashboardContract(canonical), true);
  assert.equal(hasAdminDashboardContract({ slots: [], summary: {} }), false);
  assert.equal(hasAdminDashboardContract({ ...canonical, counts: undefined }), false);
});

test("legacy reservation timestamps are reconstructed with the shared Kolkata date logic", () => {
  const result = normalizeAdminReservation({ ...base, status: "EXPIRED", startAt: undefined, endAt: undefined, bookingDate: "2026-09-04", startTime: "11:35", durationMinutes: 30 });
  assert.equal(result.startAt, "2026-09-04T06:05:00.000Z");
  assert.equal(result.endAt, "2026-09-04T06:35:00.000Z");
});

test("malformed legacy timestamps remain unavailable instead of becoming today's date", () => {
  const result = normalizeAdminReservation({ ...base, status: "COMPLETED", startAt: undefined, endAt: undefined, completedAt: undefined, bookingDate: "not-a-date", startTime: "invalid" });
  assert.equal(result.startAt, undefined);
  assert.equal(result.endAt, undefined);
  assert.equal(result.completedAt, undefined);
});
