import assert from "node:assert/strict";
import test from "node:test";
import { recordTelemetry, type TelemetryEvent, type TelemetryStore } from "../services/telemetry.service.js";
import { telemetrySchema } from "./telemetry.js";

test("accepts PARKING_DETECTED and SYSTEM_READY payloads", () => {
  assert.equal(telemetrySchema.safeParse({ eventId: "evt_demo_001", type: "PARKING_DETECTED" }).success, true);
  assert.equal(telemetrySchema.safeParse({ eventId: "evt_demo_002", type: "SYSTEM_READY" }).success, true);
});

test("rejects unknown event types, missing eventId, and unknown fields", () => {
  assert.equal(telemetrySchema.safeParse({ eventId: "evt_demo_003", type: "UNKNOWN" }).success, false);
  assert.equal(telemetrySchema.safeParse({ type: "SYSTEM_READY" }).success, false);
  assert.equal(telemetrySchema.safeParse({ eventId: "evt_demo_004", type: "SYSTEM_READY", timestamp: "2026-09-12" }).success, false);
});

test("records only the isolated telemetry document shape", async () => {
  let written: TelemetryEvent | undefined;
  const store: TelemetryStore = { createIfAbsent: async (event) => { written = event; return true; } };
  const result = await recordTelemetry("device-1", { eventId: "evt_demo_005", type: "PARKING_DETECTED" }, store, () => "server-time");
  assert.deepEqual(result, { accepted: true, duplicate: false });
  assert.deepEqual(written, { id: "evt_demo_005", deviceId: "device-1", type: "PARKING_DETECTED", source: "TELEMETRY", createdAt: "server-time" });
  assert.equal("commandId" in written!, false);
  assert.equal("slotId" in written!, false);
  assert.equal("reservationId" in written!, false);
});

test("reusing an eventId reports a safe duplicate without another state operation", async () => {
  let attempts = 0;
  const store: TelemetryStore = { createIfAbsent: async () => { attempts += 1; return attempts === 1; } };
  assert.deepEqual(await recordTelemetry("device-1", { eventId: "evt_demo_006", type: "SYSTEM_READY" }, store), { accepted: true, duplicate: false });
  assert.deepEqual(await recordTelemetry("device-1", { eventId: "evt_demo_006", type: "SYSTEM_READY" }, store), { accepted: true, duplicate: true });
});
