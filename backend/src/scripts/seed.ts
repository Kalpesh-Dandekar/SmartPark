import { FieldValue } from "firebase-admin/firestore";
import { db } from "../config/firebase.js";

const batch = db.batch();
for (let slotNumber = 1; slotNumber <= 6; slotNumber += 1) {
  const id = `slot-p${slotNumber}`;
  const ref = db.collection("parkingSlots").doc(id);
  const existing = await ref.get();
  if (!existing.exists) batch.create(ref, { id, slotNumber, name: `P${slotNumber}`, status: "AVAILABLE", isActive: true, currentReservationId: null, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
}
await batch.commit();
console.log("Parking slot seed complete (existing slots preserved).");
