import assert from "node:assert/strict";
import test from "node:test";
import { assertFutureReservation, isWithinVerificationWindow } from "./reservation-time.js";

test("rejects reservations in the past", () => { assert.throws(() => assertFutureReservation("2026-08-17", "10:00", new Date("2026-08-17T11:00:00+05:30"))); });
test("accepts reservations in the future", () => { assert.doesNotThrow(() => assertFutureReservation("2026-08-17", "10:00", new Date("2026-08-17T09:00:00+05:30"))); });
test("QR window includes arrival grace period", () => { assert.equal(isWithinVerificationWindow("2026-08-17", "10:00", 120, new Date("2026-08-17T10:05:00+05:30")), true); });
