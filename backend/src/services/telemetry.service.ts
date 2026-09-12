import { FieldValue } from "firebase-admin/firestore";
import { db } from "../config/firebase.js";
import type { TelemetryInput } from "../utils/telemetry.js";
import { canAssociateParkingDetection } from "../utils/arrival-state.js";

export interface TelemetryEvent extends Omit<TelemetryInput, "eventId"> { id: string; deviceId: string; source: "TELEMETRY"; createdAt: unknown }
export interface TelemetryStore { createIfAbsent: (event: TelemetryEvent) => Promise<boolean> }

const firestoreTelemetryStore: TelemetryStore = {
  async createIfAbsent(event) {
    const ref = db.collection("deviceEvents").doc(event.id);
    return db.runTransaction(async (transaction) => {
      if ((await transaction.get(ref)).exists) return false;
      const activeRef = db.collection("system").doc("activeArrival");
      const activeSnap = event.type === "PARKING_DETECTED" ? await transaction.get(activeRef) : null;
      const reservationId = activeSnap?.exists && typeof activeSnap.get("reservationId") === "string" ? activeSnap.get("reservationId") as string : null;
      const reservationRef = reservationId ? db.collection("reservations").doc(reservationId) : null;
      const reservationSnap = reservationRef ? await transaction.get(reservationRef) : null;
      transaction.create(ref, event);
      const activeExpiry = activeSnap?.get("expiresAt") as FirebaseFirestore.Timestamp | undefined;
      const reservation = reservationSnap?.data();
      const validAssociation = Boolean(reservationRef) && canAssociateParkingDetection({
        reservationExists: Boolean(reservationSnap?.exists),
        reservationStatus: reservation?.status,
        reservationArrivalState: reservation?.arrivalState,
        activeState: activeSnap?.get("state"),
        expiresAtMs: activeExpiry?.toMillis instanceof Function ? activeExpiry.toMillis() : undefined,
      });
      if (validAssociation && reservationRef && reservationId) {
        transaction.update(reservationRef, {
          arrivalState: "PARKING_DETECTED",
          parkingDetectedAt: event.createdAt,
          parkingTelemetryEventId: event.id,
          updatedAt: event.createdAt,
        });
        transaction.delete(activeRef);
        transaction.create(db.collection("activityLogs").doc(), {
          type: "PARKING_DETECTED",
          userId: reservation?.userId ?? null,
          reservationId,
          slotId: null,
          message: `Parking detected by hardware for reservation ${reservationId}`,
          createdAt: event.createdAt,
        });
      } else if (activeSnap?.exists && (!activeExpiry?.toMillis || activeExpiry.toMillis() <= Date.now() || !reservationSnap?.exists || reservation?.arrivalState !== "AWAITING_HARDWARE")) {
        transaction.delete(activeRef);
      }
      return true;
    });
  },
};

export async function recordTelemetry(deviceId: string, input: TelemetryInput, store: TelemetryStore = firestoreTelemetryStore, timestamp: () => unknown = () => FieldValue.serverTimestamp()) {
  const created = await store.createIfAbsent({ id: input.eventId, deviceId, type: input.type, source: "TELEMETRY", createdAt: timestamp() });
  return { accepted: true as const, duplicate: !created };
}
