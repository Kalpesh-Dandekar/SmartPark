"use client";

import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { getProfile } from "@/services/auth";
import type { UserProfile } from "@/types";

interface AuthState { firebaseUser: FirebaseUser | null; profile: UserProfile | null; loading: boolean; refreshProfile: () => Promise<void> }
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  async function refreshProfile() { setProfile(await getProfile()); }
  useEffect(() => onAuthStateChanged(getFirebaseAuth(), async (user) => { setFirebaseUser(user); if (user) { try { const token = await user.getIdToken(); setProfile(await getProfile(token)); } catch { setProfile(null); } } else setProfile(null); setLoading(false); }), []);
  const value = useMemo(() => ({ firebaseUser, profile, loading, refreshProfile }), [firebaseUser, profile, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used within AuthProvider"); return value; }
