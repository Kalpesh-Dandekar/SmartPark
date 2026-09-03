import { FieldValue } from "firebase-admin/firestore";
import { db } from "../config/firebase.js";
import { HttpError } from "../utils/http-error.js";
import type { UserProfile } from "../types/index.js";
import { logActivity } from "./activity.service.js";

export async function getUserProfile(uid: string): Promise<UserProfile> {
  const snapshot = await db.collection("users").doc(uid).get();
  if (!snapshot.exists) throw new HttpError(404, "User profile not found", "PROFILE_NOT_FOUND");
  const data = snapshot.data()!;
  return { uid, name: data.name, email: data.email, vehicleNumber: data.vehicleNumber, role: data.role, createdAt: data.createdAt?.toDate().toISOString(), updatedAt: data.updatedAt?.toDate().toISOString() };
}

export async function createUserProfile(input: { uid: string; name: string; email: string; vehicleNumber?: string }) {
  const ref = db.collection("users").doc(input.uid);
  const existing = await ref.get();
  if (existing.exists) return getUserProfile(input.uid);
  await ref.set({ ...input, role: "user", createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  await logActivity({ type: "USER_REGISTERED", userId: input.uid, message: `User registered: ${input.email}` });
  return getUserProfile(input.uid);
}
