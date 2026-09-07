"use client";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "@/components/shared/brand";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProtectedRoute } from "@/features/auth/protected-route";
import { confirmParking } from "@/services/qr";
import type { ApiReservation } from "@/types";

export default function VerifyQrPage(){const params=useParams<{token:string}>();const [result,setResult]=useState<ApiReservation|null>(null);const [error,setError]=useState("");useEffect(()=>{confirmParking(params.token).then(setResult).catch((value:unknown)=>setError(value instanceof Error?value.message:"QR confirmation failed."));},[params.token]);return <ProtectedRoute><main className="flex min-h-screen items-center justify-center bg-background px-4 py-10"><div className="w-full max-w-md"><div className="mb-6 flex justify-center"><Brand/></div><Card><CardContent className="py-8 text-center">{!result&&!error?<p className="text-sm text-slate-600">Confirming your parking session…</p>:result?<><CheckCircle2 className="mx-auto size-12 text-emerald-600" aria-hidden="true"/><h1 className="mt-4 text-xl font-bold">Parking Confirmed</h1><p className="mt-2 text-sm leading-6 text-slate-600">Your reservation is now marked as parked.</p></>:<><XCircle className="mx-auto size-12 text-red-600" aria-hidden="true"/><h1 className="mt-4 text-xl font-bold">Unable to Confirm</h1><p role="alert" className="mt-2 text-sm text-slate-600">{error||"Invalid reservation."}</p></>}<Link href="/bookings" className={buttonStyles({variant:"outline",className:"mt-6 w-full"})}>Back to My Bookings</Link></CardContent></Card></div></main></ProtectedRoute>}
