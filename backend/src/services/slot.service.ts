import type { ParkingSlot } from "../types/index.js";
import { db } from "../config/firebase.js";
import { HttpError } from "../utils/http-error.js";
import { serializeDocument } from "../utils/serialize.js";

export async function listSlots(): Promise<ParkingSlot[]> {
  const snapshot = await db.collection("parkingSlots").orderBy("slotNumber").get();
  return snapshot.docs.map((doc) => serializeDocument<ParkingSlot>(doc));
}

export async function getSlot(id: string): Promise<ParkingSlot> {
  const snapshot = await db.collection("parkingSlots").doc(id).get();
  if (!snapshot.exists) throw new HttpError(404, "Parking slot not found", "SLOT_NOT_FOUND");
  const data = snapshot.data()!;
  return { id: snapshot.id, ...data, createdAt: data.createdAt?.toDate().toISOString(), updatedAt: data.updatedAt?.toDate().toISOString() } as ParkingSlot;
}
