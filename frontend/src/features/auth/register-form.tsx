"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/features/auth/password-field";

export function RegisterForm() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Temporary UI-phase navigation; Firebase Authentication will replace this.
    router.push("/dashboard");
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
      <Button type="submit" size="lg" className="w-full">
        Create Account
      </Button>
      <p className="text-center text-xs leading-5 text-slate-500">
        Account creation will be connected in a future milestone.
      </p>
    </form>
  );
}
