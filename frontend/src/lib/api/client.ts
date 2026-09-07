import { getFirebaseAuth } from "@/lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
interface ApiEnvelope<T> { data: T }
interface ApiErrorEnvelope { error?: { message?: string } }

export async function apiRequest<T>(path: string, init: RequestInit = {}, tokenOverride?: string): Promise<T> {
  const firebaseAuth = getFirebaseAuth();
  await firebaseAuth.authStateReady();
  const token = tokenOverride ?? await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("You must be signed in to continue.");
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init.headers } });
  if (!response.ok) { const body = await response.json().catch(() => ({})) as ApiErrorEnvelope; throw new Error(body.error?.message ?? "Request failed. Please try again."); }
  if (response.status === 204) return undefined as T;
  return ((await response.json()) as ApiEnvelope<T>).data;
}
