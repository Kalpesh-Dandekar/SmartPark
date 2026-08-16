"use client";

import { CalendarPlus, CheckCircle2, Clock3, QrCode, TriangleAlert, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import QRCode from "react-qr-code";

import { AppShell } from "@/components/layout/app-shell";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockBookings, mockParkingSlots, mockUser } from "@/data/mock";
import type { Booking, LateReservationStatus } from "@/types";

type UserLateArrivalStatus = LateReservationStatus | "on-the-way";

export function BookingsView() {
  const booking = mockBookings.find((item) => item.status === "reserved");
  const history = mockBookings.filter((item) => item.status !== "reserved");
  const [cancelled, setCancelled] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  function closeDialog() {
    dialogRef.current?.close();
  }

  function cancelBooking() {
    setCancelled(true);
    closeDialog();
  }

  return (
    <AppShell user={mockUser}>
      <main className="min-w-0">
        <Container className="py-8 sm:py-10 lg:py-12">
          <PageHeader
            title="My Bookings"
            description="View and manage your parking reservations."
            action={<Link href="/book" className={buttonStyles()}><CalendarPlus className="size-4" aria-hidden="true" />Book Another Slot</Link>}
          />

          {!booking || cancelled ? (
            <EmptyBooking />
          ) : (
            <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
              <CurrentBooking booking={booking} onCancel={() => dialogRef.current?.showModal()} />
              <div className="space-y-6">
                <BookingQr booking={booking} />
                <LateArrivalPanel booking={booking} onCancel={() => dialogRef.current?.showModal()} />
              </div>
            </div>
          )}

          <BookingHistory bookings={history} />
        </Container>
      </main>

      <dialog ref={dialogRef} className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-950/40" aria-labelledby="cancel-title">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><h2 id="cancel-title" className="text-lg font-bold text-slate-950">Cancel this reservation?</h2><p className="mt-2 text-sm leading-6 text-slate-600">Slot {booking ? getSlotLabel(booking.slotId) : ""} will become available again.</p></div>
            <button type="button" onClick={closeDialog} aria-label="Close cancellation dialog" className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25"><X className="size-4" aria-hidden="true" /></button>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={closeDialog} autoFocus>Keep Booking</Button>
            <Button variant="destructive" onClick={cancelBooking}>Cancel Reservation</Button>
          </div>
        </div>
      </dialog>
    </AppShell>
  );
}

function CurrentBooking({ booking, onCancel }: { booking: Booking; onCancel: () => void }) {
  const graceDeadline = new Date(new Date(booking.startsAt).getTime() + 10 * 60 * 1000);
  return (
    <Card>
      <CardHeader className="border-b border-slate-200">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Current Booking</p>
        <div className="mt-3 flex items-center justify-between gap-4"><CardTitle className="font-mono text-3xl">Slot {getSlotLabel(booking.slotId)}</CardTitle><StatusBadge status={booking.status} /></div>
      </CardHeader>
      <CardContent className="pt-5 sm:pt-6">
        <dl className="grid gap-5 sm:grid-cols-2">
          <Detail label="Date" value={formatDate(booking.startsAt)} />
          <Detail label="Time" value={`${formatTime(booking.startsAt)} – ${formatTime(booking.endsAt)}`} />
          <Detail label="Vehicle" value={booking.vehicleNumber} mono />
          <Detail label="Arrive Before" value={formatTime(graceDeadline)} />
          <Detail label="Booking ID" value={booking.id} mono />
        </dl>
        <div className="mt-6 border-t border-slate-200 pt-5"><Button variant="outline" className="w-full text-red-700 hover:border-red-200 hover:bg-red-50" onClick={onCancel}>Cancel Booking</Button></div>
      </CardContent>
    </Card>
  );
}

function BookingQr({ booking }: { booking: Booking }) {
  return (
    <Card>
      <CardHeader className="border-b border-slate-200"><div className="flex items-center gap-2"><QrCode className="size-5 text-blue-700" aria-hidden="true" /><CardTitle>Parking Access QR</CardTitle></div><p className="mt-1 text-sm leading-6 text-slate-600">Scan at the parking entrance to verify your reservation.</p></CardHeader>
      <CardContent className="pt-5 text-center sm:pt-6">
        <div role="img" aria-label={`Demo parking access QR for booking ${booking.id}`} className="mx-auto w-full max-w-48 rounded-xl border border-slate-200 bg-white p-4"><QRCode value={`SMARTPARK:${booking.id}`} className="h-auto w-full" aria-hidden="true" /></div>
        <p className="mt-4 font-mono text-sm font-semibold text-slate-900">Booking ID: {booking.id}</p>
        <p className="mt-1 text-xs text-slate-500">Demo booking QR</p>
      </CardContent>
    </Card>
  );
}

function LateArrivalPanel({ booking, onCancel }: { booking: Booking; onCancel: () => void }) {
  const [status, setStatus] = useState<UserLateArrivalStatus>("grace-period");
  const [showRequest, setShowRequest] = useState(false);
  const [extension, setExtension] = useState("10");
  const [reason, setReason] = useState("Traffic delay");
  const deadline = new Date(new Date(booking.startsAt).getTime() + 10 * 60 * 1000);
  const extendedDeadline = new Date(deadline.getTime() + Number(extension) * 60 * 1000);

  if (status === "released") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5" role="status">
        <h2 className="font-semibold text-red-950">Reservation Released</h2>
        <p className="mt-2 text-sm leading-6 text-red-900">Slot {getSlotLabel(booking.slotId)} is now available for another user.</p>
        <div className="mt-4"><StatusBadge status="available" /></div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5" role="status">
        <h2 className="font-semibold text-red-950">Reservation Expired</h2>
        <p className="mt-2 text-sm leading-6 text-red-900">No arrival or extension response was received within the allowed grace period.</p>
        <p className="mt-2 text-sm font-semibold text-red-950">Slot {getSlotLabel(booking.slotId)} has been released.</p>
        <Button variant="destructive" className="mt-4 w-full" onClick={() => setStatus("released")}>Show Released Slot</Button>
      </div>
    );
  }

  if (status === "extension-requested") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5" role="status">
        <h2 className="font-semibold text-amber-950">Extension Requested</h2>
        <p className="mt-2 text-sm leading-6 text-amber-900">Your request for {extension} additional minutes is awaiting a response.</p>
        <p className="mt-2 text-xs text-amber-800">Demo state only—no request was sent.</p>
        <Button variant="outline" className="mt-4 w-full" onClick={() => setStatus("extended")}>Preview Approval</Button>
      </div>
    );
  }

  if (status === "extended") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5" role="status">
        <div className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" /><div><h2 className="font-semibold text-emerald-950">Extension Approved</h2><p className="mt-1 text-sm text-emerald-900">New arrival deadline: {formatTime(extendedDeadline)}</p><p className="mt-2 text-xs text-emerald-800">Deterministic UI preview; no admin or backend action occurred.</p></div></div>
      </div>
    );
  }

  if (status === "on-the-way") {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5" role="status">
        <h2 className="font-semibold text-blue-950">On-the-way status noted</h2>
        <p className="mt-2 text-sm leading-6 text-blue-900">Your reservation remains held until {formatTime(deadline)}. Please arrive within the grace period.</p>
        <p className="mt-2 text-xs text-blue-800">Local UI preview only—no notification was sent.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex gap-3"><TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-700" aria-hidden="true" /><div><h2 className="font-semibold text-amber-950">You&apos;re running late</h2><p className="mt-1 text-sm leading-6 text-amber-900">Your reservation is still being held until {formatTime(deadline)}.</p><p className="mt-2 text-sm font-semibold text-amber-950">Need more time?</p></div></div>

      {showRequest ? (
        <form className="mt-5 rounded-lg border border-amber-200 bg-white/70 p-4" onSubmit={(event) => { event.preventDefault(); setStatus("extension-requested"); }}>
          <h3 className="font-semibold text-slate-950">Request an extension</h3>
          <label className="mt-4 block text-sm font-medium text-slate-800">Additional time<select value={extension} onChange={(event) => setExtension(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15"><option value="5">5 minutes</option><option value="10">10 minutes</option><option value="15">15 minutes</option></select></label>
          <label className="mt-4 block text-sm font-medium text-slate-800">Reason <span className="font-normal text-slate-500">(optional)</span><input value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15" /></label>
          <Button type="submit" className="mt-4 w-full">Request Extension</Button>
        </form>
      ) : (
        <div className="mt-5 grid gap-2">
          <Button onClick={() => setStatus("on-the-way")}>I&apos;m on the way</Button>
          <Button variant="outline" onClick={() => setShowRequest(true)}>Request More Time</Button>
          <Button variant="ghost" className="text-red-700" onClick={onCancel}>Cancel Reservation</Button>
          <button type="button" onClick={() => setStatus("expired")} className="mt-1 rounded-md text-xs font-medium text-slate-500 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25">Preview no-response expiry</button>
        </div>
      )}
    </div>
  );
}

function BookingHistory({ bookings }: { bookings: Booking[] }) {
  return (
    <Card className="mt-6 overflow-hidden">
      <CardHeader className="border-b border-slate-200"><CardTitle>Booking History</CardTitle><p className="mt-1 text-sm text-slate-600">Your recent parking reservations.</p></CardHeader>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-3 font-semibold">Slot</th><th className="px-6 py-3 font-semibold">Date</th><th className="px-6 py-3 font-semibold">Time</th><th className="px-6 py-3 font-semibold">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{bookings.map((item) => <tr key={item.id}><td className="px-6 py-4 font-mono font-semibold">{getSlotLabel(item.slotId)}</td><td className="px-6 py-4 text-slate-600">{formatDate(item.startsAt)}</td><td className="px-6 py-4 text-slate-600">{formatTime(item.startsAt)}</td><td className="px-6 py-4"><StatusBadge status={item.status} /></td></tr>)}</tbody></table>
      </div>
      <CardContent className="divide-y divide-slate-100 p-0 sm:hidden">{bookings.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 p-5"><div><p className="font-mono font-bold">Slot {getSlotLabel(item.slotId)}</p><p className="mt-1 text-sm text-slate-600">{formatDate(item.startsAt)} · {formatTime(item.startsAt)}</p></div><StatusBadge status={item.status} /></div>)}</CardContent>
    </Card>
  );
}

function EmptyBooking() {
  return <Card className="mt-8"><CardContent className="py-12 text-center sm:py-16"><Clock3 className="mx-auto size-10 text-slate-400" aria-hidden="true" /><h2 className="mt-4 text-lg font-bold text-slate-950">No active reservation</h2><p className="mt-2 text-sm text-slate-600">Reserve a parking slot before your next trip.</p><Link href="/book" className={buttonStyles({ className: "mt-6" })}>Book a Slot</Link></CardContent></Card>;
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className={`mt-1 text-sm font-semibold text-slate-950 ${mono ? "font-mono" : ""}`}>{value}</dd></div>;
}

function getSlotLabel(slotId: string) { return mockParkingSlots.find((slot) => slot.id === slotId)?.label ?? slotId; }
function formatDate(value: string | Date) { return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(value)); }
function formatTime(value: string | Date) { return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).format(new Date(value)); }
