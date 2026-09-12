import assert from "node:assert/strict";
import test from "node:test";
import { assertFutureReservation, isWithinArrivalVerificationWindow, isWithinVerificationWindow } from "./reservation-time.js";

test("rejects reservations in the past", () => { assert.throws(() => assertFutureReservation("2026-08-17", "10:00", new Date("2026-08-17T11:00:00+05:30"))); });
test("accepts reservations in the future", () => { assert.doesNotThrow(() => assertFutureReservation("2026-08-17", "10:00", new Date("2026-08-17T09:00:00+05:30"))); });
test("QR window includes arrival grace period", () => { assert.equal(isWithinVerificationWindow("2026-08-17", "10:00", 120, new Date("2026-08-17T10:05:00+05:30")), true); });

const timestamp = (value: string) => ({ toDate: () => new Date(value) });
const canonicalWindow = {
  startAt: timestamp("2026-09-12T06:30:00.000Z"),
  endAt: timestamp("2026-09-12T08:30:00.000Z"),
  bookingDate: "2099-01-01",
  startTime: "00:00",
  durationMinutes: 1,
};

test("arrival verification accepts an instant inside canonical startAt/endAt window", () => {
  assert.equal(isWithinArrivalVerificationWindow(canonicalWindow, new Date("2026-09-12T06:27:00.000Z")), true);
});

test("arrival verification rejects an instant before the canonical window", () => {
  assert.equal(isWithinArrivalVerificationWindow(canonicalWindow, new Date("2026-09-12T05:59:59.999Z")), false);
});

test("arrival verification rejects an instant after the canonical grace period", () => {
  assert.equal(isWithinArrivalVerificationWindow(canonicalWindow, new Date("2026-09-12T08:40:00.001Z")), false);
});

test("arrival verification accepts the exact earliest canonical boundary", () => {
  assert.equal(isWithinArrivalVerificationWindow(canonicalWindow, new Date("2026-09-12T06:00:00.000Z")), true);
});

test("arrival verification accepts the exact latest canonical boundary", () => {
  assert.equal(isWithinArrivalVerificationWindow(canonicalWindow, new Date("2026-09-12T08:40:00.000Z")), true);
});

test("arrival verification retains the IST legacy fallback", () => {
  const legacy = { bookingDate: "2026-09-12", startTime: "12:00", durationMinutes: 120 };
  assert.equal(isWithinArrivalVerificationWindow(legacy, new Date("2026-09-12T11:57:00+05:30")), true);
});

test("malformed canonical timestamps safely use the legacy fallback", () => {
  const malformed = { startAt: { toDate: () => new Date("invalid") }, endAt: { toDate: () => { throw new Error("invalid timestamp"); } }, bookingDate: "2026-09-12", startTime: "12:00", durationMinutes: 120 };
  assert.equal(isWithinArrivalVerificationWindow(malformed, new Date("2026-09-12T11:57:00+05:30")), true);
});
