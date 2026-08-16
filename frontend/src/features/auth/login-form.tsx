"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/features/auth/password-field";

export function LoginForm() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Temporary UI-phase navigation; Firebase Authentication will replace this.
    router.push("/dashboard");
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
      <Button type="submit" size="lg" className="w-full">
        Sign In
      </Button>
      <p className="text-center text-xs leading-5 text-slate-500">
        Authentication will be connected in a future milestone.
      </p>
    </form>
  );
}
