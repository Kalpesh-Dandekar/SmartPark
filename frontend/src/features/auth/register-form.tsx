"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/features/auth/password-field";
import { register } from "@/services/auth";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); const data = new FormData(event.currentTarget); const password = String(data.get("password"));
    if (password !== String(data.get("confirmPassword"))) { setError("Passwords do not match."); return; }
    setLoading(true);
    try { await register({ name: String(data.get("name")), email: String(data.get("email")), password, vehicleNumber: String(data.get("vehicleNumber")) }); router.push("/dashboard"); }
    catch (value) { setError(value instanceof Error ? value.message : "Unable to create account."); setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Full name"
        name="name"
        placeholder="Your full name"
        autoComplete="name"
        required
      />
      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        inputMode="email"
        required
      />
      <Input
        label="Vehicle number"
        name="vehicleNumber"
        placeholder="MH 04 AB 1234"
        autoComplete="off"
        helperText="Use the number shown on your registration plate."
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <PasswordField
          label="Password"
          name="password"
          placeholder="Create a password"
          autoComplete="new-password"
          required
        />
        <PasswordField
          label="Confirm password"
          name="confirmPassword"
          placeholder="Repeat password"
          autoComplete="new-password"
          required
        />
      </div>
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Creating account…" : "Create Account"}
      </Button>
      <p className="text-center text-xs leading-5 text-slate-500">
        New accounts are created with standard user access.
      </p>
    </form>
  );
}
