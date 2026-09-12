import { FieldValue } from "firebase-admin/firestore";
import { db } from "../config/firebase.js";
import type { TelemetryInput } from "../utils/telemetry.js";

export interface TelemetryEvent extends Omit<TelemetryInput, "eventId"> { id: string; deviceId: string; source: "TELEMETRY"; createdAt: unknown }
export interface TelemetryStore { createIfAbsent: (event: TelemetryEvent) => Promise<boolean> }

const firestoreTelemetryStore: TelemetryStore = {
  async createIfAbsent(event) {
    const ref = db.collection("deviceEvents").doc(event.id);
    return db.runTransaction(async (transaction) => {
      if ((await transaction.get(ref)).exists) return false;
      transaction.create(ref, event);
      return true;
    });
  },
};

export async function recordTelemetry(deviceId: string, input: TelemetryInput, store: TelemetryStore = firestoreTelemetryStore, timestamp: () => unknown = () => FieldValue.serverTimestamp()) {
  const created = await store.createIfAbsent({ id: input.eventId, deviceId, type: input.type, source: "TELEMETRY", createdAt: timestamp() });
  return { accepted: true as const, duplicate: !created };
}
