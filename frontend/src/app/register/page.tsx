import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/features/auth/auth-shell";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account | SmartPark",
  description: "Create a SmartPark account to reserve and manage parking.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your SmartPark account"
      description="Reserve parking in advance and manage your bookings in one place."
      footer={
        <p>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-700 hover:text-blue-800 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/20"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
