import { FieldValue } from "firebase-admin/firestore";
import { db } from "../config/firebase.js";

export async function logActivity(input: { type: string; userId?: string | null; reservationId?: string | null; slotId?: string | null; message: string }) {
  await db.collection("activityLogs").add({ ...input, userId: input.userId ?? null, reservationId: input.reservationId ?? null, slotId: input.slotId ?? null, createdAt: FieldValue.serverTimestamp() });
}
