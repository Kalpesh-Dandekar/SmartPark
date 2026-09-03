import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { apiRequest } from "@/lib/api/client";
import { getFirebaseAuth } from "@/lib/firebase";
import type { UserProfile } from "@/types";

export async function register(input: { name: string; email: string; password: string; vehicleNumber: string }) {
  const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), input.email, input.password);
  try { return await apiRequest<UserProfile>("/api/auth/profile", { method: "POST", body: JSON.stringify({ name: input.name, vehicleNumber: input.vehicleNumber }) }); }
  catch (error) { await credential.user.delete().catch(() => undefined); throw error; }
}
export async function login(email: string, password: string) { await signInWithEmailAndPassword(getFirebaseAuth(), email, password); const profile = await apiRequest<UserProfile>("/api/auth/me"); await apiRequest<void>("/api/auth/login-event", { method: "POST" }); return profile; }
export async function logout() { await signOut(getFirebaseAuth()); }
export async function getProfile() { return apiRequest<UserProfile>("/api/auth/me"); }
