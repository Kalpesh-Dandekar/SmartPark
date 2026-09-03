"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Brand } from "@/components/shared/brand";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProtectedRoute } from "@/features/auth/protected-route";
import { verifyQr } from "@/services/qr";
import type { QRVerificationResult } from "@/types";

export default function VerifyQrPage() {
  const params = useParams<{ token: string }>();
  const [result, setResult] = useState<QRVerificationResult | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { verifyQr(params.token).then(setResult).catch((value: unknown) => setError(value instanceof Error ? value.message : "QR verification failed.")); }, [params.token]);

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md"><div className="mb-6 flex justify-center"><Brand /></div><Card><CardContent className="py-8 text-center">{!result && !error ? <p className="text-sm text-slate-600">Verifying parking reservation…</p> : result?.valid ? <><CheckCircle2 className="mx-auto size-12 text-emerald-600" aria-hidden="true" /><h1 className="mt-4 text-xl font-bold">Reservation Verified</h1><p className="mt-2 text-sm text-slate-600">Slot P{result.slotNumber} is reserved for booking {result.reservationId}.</p></> : <><XCircle className="mx-auto size-12 text-red-600" aria-hidden="true" /><h1 className="mt-4 text-xl font-bold">Unable to Verify</h1><p role="alert" className="mt-2 text-sm text-slate-600">{error || result?.reason || "Invalid reservation."}</p></>}<Link href="/bookings" className={buttonStyles({ variant: "outline", className: "mt-6 w-full" })}>Back to My Bookings</Link></CardContent></Card></div>
      </main>
    </ProtectedRoute>
  );
}
