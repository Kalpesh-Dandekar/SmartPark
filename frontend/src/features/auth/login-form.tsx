"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/features/auth/password-field";
import { login } from "@/services/auth";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setLoading(true);
    try { const data = new FormData(event.currentTarget); const profile = await login(String(data.get("email")), String(data.get("password"))); router.push(profile.role === "admin" ? "/admin/dashboard" : "/dashboard"); }
    catch (value) { setError(value instanceof Error ? value.message : "Unable to sign in."); setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        inputMode="email"
        required
      />
      <PasswordField
        label="Password"
        name="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        required
      />
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign In"}
      </Button>
      <p className="text-center text-xs leading-5 text-slate-500">
        Secure authentication is provided by Firebase.
      </p>
    </form>
  );
}
