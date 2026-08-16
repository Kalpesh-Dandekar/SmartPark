"use client";

import { CheckCircle2, CarFront, Route } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { ParkingSlot } from "@/components/shared/parking-slot";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockParkingSlots, mockUser } from "@/data/mock";

const durations = [
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "120", label: "2 hours" },
  { value: "180", label: "3 hours" },
  { value: "240", label: "4 hours" },
];

export function BookSlotView() {
  const [date, setDate] = useState("2026-08-17");
  const [arrival, setArrival] = useState("10:00");
  const [duration, setDuration] = useState("120");
  const [showSlots, setShowSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState("slot-p4");
  const [confirmed, setConfirmed] = useState(false);
  const selected = mockParkingSlots.find((slot) => slot.id === selectedSlot);

  function findSlots(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmed(false);
    setShowSlots(true);
  }

  return (
    <AppShell user={mockUser}>
      <main className="min-w-0">
        <Container className="py-8 sm:py-10 lg:py-12">
          <PageHeader
            title="Book a Slot"
            description="Choose when you're arriving and reserve an available parking space."
          />

          <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(19rem,0.7fr)]">
            <div className="space-y-6">
              <Card>
                <CardHeader className="border-b border-slate-200">
                  <CardTitle>Reservation Details</CardTitle>
                  <p className="mt-1 text-sm text-slate-600">Set your arrival details to preview availability.</p>
                </CardHeader>
                <CardContent className="pt-5 sm:pt-6">
                  <form onSubmit={findSlots} className="grid gap-5 sm:grid-cols-3">
                    <Input label="Date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
                    <Input label="Arrival Time" type="time" value={arrival} onChange={(event) => setArrival(event.target.value)} required />
                    <label className="block text-sm font-medium text-slate-800">
                      Expected Duration
                      <select
                        value={duration}
                        onChange={(event) => setDuration(event.target.value)}
                        className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-base text-slate-950 outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 sm:text-sm"
                      >
                        {durations.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                      </select>
                    </label>
                    <Button type="submit" className="sm:col-span-3 sm:w-fit">Find Available Slots</Button>
                  </form>
                </CardContent>
              </Card>

              {showSlots ? (
                <Card className="overflow-hidden">
                  <CardHeader className="border-b border-slate-200">
                    <CardTitle>Available Slots</CardTitle>
                    <p className="mt-1 text-sm text-slate-600">Select one of the currently available parking spaces.</p>
                  </CardHeader>
                  <CardContent className="bg-slate-50/60 p-4 sm:p-6">
                    <div className="mb-5 flex items-center gap-3" aria-label="Parking entry lane">
                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                        <CarFront className="size-4" aria-hidden="true" /> Entry
                      </div>
                      <div className="h-px flex-1 border-t border-dashed border-slate-300" aria-hidden="true" />
                      <Route className="size-4 text-slate-400" aria-hidden="true" />
                    </div>
                    <div className="relative grid grid-cols-2 gap-3 sm:gap-x-8 sm:gap-y-4">
                      {mockParkingSlots.map((slot) => (
                        <ParkingSlot
                          key={slot.id}
                          label={slot.label}
                          status={slot.status}
                          selected={selectedSlot === slot.id}
                          onClick={slot.status === "available" ? () => { setSelectedSlot(slot.id); setConfirmed(false); } : undefined}
                          className="min-h-24 bg-white px-2 py-4 sm:min-h-28"
                        />
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap justify-center gap-2 border-t border-slate-200 pt-4">
                      <StatusBadge status="available" /><StatusBadge status="occupied" /><StatusBadge status="reserved" />
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            <Card className="xl:sticky xl:top-6">
              <CardHeader className="border-b border-slate-200"><CardTitle>Reservation Summary</CardTitle></CardHeader>
              <CardContent className="pt-5 sm:pt-6">
                {selected ? (
                  <>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
                      <SummaryItem label="Slot" value={selected.label} />
                      <SummaryItem label="Date" value={formatDate(date)} />
                      <SummaryItem label="Arrival" value={formatTime(arrival)} />
                      <SummaryItem label="Duration" value={durations.find((item) => item.value === duration)?.label ?? duration} />
                      <SummaryItem label="Grace Period" value="10 minutes" />
                      <SummaryItem label="Arrive Before" value={addMinutes(arrival, 10)} />
                    </dl>
                    {confirmed ? (
                      <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4" role="status">
                        <div className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" /><div><p className="font-semibold text-emerald-950">Reservation Confirmed</p><p className="mt-1 text-sm leading-5 text-emerald-900">Slot {selected.label} has been reserved for your selected time.</p></div></div>
                        <Link href="/bookings" className={buttonStyles({ className: "mt-4 w-full" })}>View My Booking</Link>
                      </div>
                    ) : (
                      <Button className="mt-6 w-full" onClick={() => setConfirmed(true)}>Confirm Reservation</Button>
                    )}
                  </>
                ) : <p className="text-sm text-slate-600">Choose an available slot to review your reservation.</p>}
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>
    </AppShell>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-950">{value}</dd></div>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${value}T00:00:00+05:30`));
}

function formatTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" }).format(new Date(Date.UTC(2026, 0, 1, hour, minute)));
}

function addMinutes(value: string, minutes: number) {
  const [hour, minute] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" }).format(new Date(Date.UTC(2026, 0, 1, hour, minute + minutes)));
}
