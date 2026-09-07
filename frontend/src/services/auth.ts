import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { apiRequest } from "@/lib/api/client";
import { getFirebaseAuth } from "@/lib/firebase";
import type { UserProfile } from "@/types";

export async function register(input: { name: string; email: string; password: string; vehicleNumber: string }) {
  const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), input.email, input.password);
  try { const token = await credential.user.getIdToken(true); return await apiRequest<UserProfile>("/api/auth/profile", { method: "POST", body: JSON.stringify({ name: input.name, vehicleNumber: input.vehicleNumber }) }, token); }
  catch (error) { await credential.user.delete().catch(() => undefined); throw error; }
}
export async function login(email: string, password: string) { const firebaseAuth = getFirebaseAuth(); const credential = await signInWithEmailAndPassword(firebaseAuth, email, password); try { const token = await credential.user.getIdToken(true); const profile = await apiRequest<UserProfile>("/api/auth/me", {}, token); await apiRequest<void>("/api/auth/login-event", { method: "POST" }, token); return profile; } catch (error) { await signOut(firebaseAuth); throw error; } }
export async function logout() { await signOut(getFirebaseAuth()); }
export async function getProfile(token?: string) { return apiRequest<UserProfile>("/api/auth/me", {}, token); }
