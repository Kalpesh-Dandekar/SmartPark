"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/features/auth/auth-provider";

export function ProtectedRoute({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { firebaseUser, profile, loading } = useAuth(); const router = useRouter();
  useEffect(() => { if (!loading && (!firebaseUser || !profile)) router.replace("/login"); else if (!loading && admin && profile?.role !== "admin") router.replace("/dashboard"); }, [admin, firebaseUser, loading, profile, router]);
  if (loading || !firebaseUser || !profile || (admin && profile.role !== "admin")) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-sm text-slate-600">Checking access…</p></div>;
  return children;
}
