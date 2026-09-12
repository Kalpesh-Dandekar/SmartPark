import assert from "node:assert/strict";
import test from "node:test";
import { canAssociateParkingDetection, isBookedForArrival, requiresParkingDetection } from "./arrival-state.js";

test("arrival verification accepts canonical BOOKED and legacy ACTIVE only", () => {
  assert.equal(isBookedForArrival("BOOKED"), true);
  assert.equal(isBookedForArrival("ACTIVE"), true);
  for (const status of ["PARKED", "COMPLETED", "CANCELLED", "EXPIRED"] as const) assert.equal(isBookedForArrival(status), false);
});

test("new flow and arrival metadata require hardware detection while legacy documents remain compatible", () => {
  assert.equal(requiresParkingDetection(1, undefined), true);
  assert.equal(requiresParkingDetection(undefined, "AWAITING_HARDWARE"), true);
  assert.equal(requiresParkingDetection(undefined, undefined), false);
});

test("a valid active arrival can consume one parking detection", () => {
  assert.equal(canAssociateParkingDetection({ reservationExists: true, reservationStatus: "BOOKED", reservationArrivalState: "AWAITING_HARDWARE", activeState: "AWAITING_HARDWARE", expiresAtMs: 2000 }, 1000), true);
});

test("parking detection association rejects missing, stale, completed, or already consumed arrivals", () => {
  const valid = { reservationExists: true, reservationStatus: "BOOKED" as const, reservationArrivalState: "AWAITING_HARDWARE", activeState: "AWAITING_HARDWARE", expiresAtMs: 2000 };
  assert.equal(canAssociateParkingDetection({ ...valid, reservationExists: false }, 1000), false);
  assert.equal(canAssociateParkingDetection({ ...valid, expiresAtMs: 1000 }, 1000), false);
  assert.equal(canAssociateParkingDetection({ ...valid, reservationStatus: "CANCELLED" }, 1000), false);
  assert.equal(canAssociateParkingDetection({ ...valid, reservationStatus: "EXPIRED" }, 1000), false);
  assert.equal(canAssociateParkingDetection({ ...valid, reservationArrivalState: "PARKING_DETECTED" }, 1000), false);
});
