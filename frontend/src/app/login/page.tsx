import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/features/auth/auth-shell";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In | SmartPark",
  description: "Sign in to manage your SmartPark parking reservations.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to manage your parking reservations."
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-700 hover:text-blue-800 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/20"
          >
            Create account
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
