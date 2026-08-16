"use client";

import {
  Activity,
  CalendarClock,
  CarFront,
  CheckCircle2,
  CircleParking,
  RadioTower,
  Route,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

import { AdminShell } from "@/components/layout/admin-shell";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { ParkingSlot } from "@/components/shared/parking-slot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockLateArrivalActivity, mockLateReservations, mockParkingSlots } from "@/data/mock";
import { cn } from "@/lib/cn";
import type { AdminActivity, LateReservation, LateReservationStatus, ParkingSlotStatus } from "@/types";

const lateStyles: Record<LateReservationStatus, { label: string; className: string }> = {
  "grace-period": { label: "Grace Period", className: "border-amber-200 bg-amber-50 text-amber-900" },
  "extension-requested": { label: "Extension Requested", className: "border-amber-200 bg-amber-50 text-amber-900" },
  extended: { label: "Extended", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  expired: { label: "Expired", className: "border-red-200 bg-red-50 text-red-800" },
  released: { label: "Released", className: "border-red-200 bg-red-50 text-red-800" },
};

const reservations = [
  { id: "SP-1042", user: "Aarav Mehta", vehicle: "MH 12 AB 4582", slot: "P3", time: "10:00 AM", status: "Reserved" },
  { id: "SP-1044", user: "Priya Shah", vehicle: "MH 02 CD 7711", slot: "P1", time: "11:30 AM", status: "Upcoming" },
  { id: "SP-1040", user: "Rohan Desai", vehicle: "MH 14 EF 2208", slot: "P4", time: "09:00 AM", status: "Completed" },
  { id: "SP-1038", user: "Alex Morgan", vehicle: "MH 04 AB 1234", slot: "P5", time: "10:00 AM", status: "Expired" },
] as const;

const systemDevices = [
  ["Arduino UNO", "Online"], ["ESP32 Wi-Fi Module", "Online"], ["Entry Ultrasonic", "Active"],
  ["Slot Ultrasonic", "Active"], ["Gate Servo", "Ready"], ["Stepper Motor", "Ready"], ["LCD Display", "Active"],
] as const;

export function AdminLateReservationsView() {
  const [lateReservations, setLateReservations] = useState(mockLateReservations);
  const [activity, setActivity] = useState<AdminActivity[]>(mockLateArrivalActivity);
  const [selectedSlotId, setSelectedSlotId] = useState("slot-p3");
  const releasedIds = new Set(lateReservations.filter((item) => item.status === "released").map((item) => item.slotId));
  const liveSlots = mockParkingSlots.map((slot) => releasedIds.has(slot.id) ? { ...slot, status: "available" as const } : slot);
  const selectedSlot = liveSlots.find((slot) => slot.id === selectedSlotId) ?? liveSlots[0];

  function updateReservation(id: string, status: LateReservationStatus) {
    const reservation = lateReservations.find((item) => item.id === id);
    if (!reservation) return;
    setLateReservations((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    const slot = getSlotLabel(reservation.slotId);
    setActivity((current) => [{
      id: `local-${id}-${status}`,
      occurredAt: "2026-08-17T10:09:00+05:30",
      description: status === "extended" ? `Extension approved for ${id} until 10:20 AM` : `Reservation released; ${slot} returned to availability`,
    }, ...current]);
  }

  const metrics = [
    { label: "Total Slots", value: liveSlots.length, icon: CircleParking, style: "bg-slate-900 text-white" },
    { label: "Available", value: liveSlots.filter((slot) => slot.status === "available").length, icon: CheckCircle2, style: "bg-emerald-50 text-emerald-700" },
    { label: "Occupied", value: liveSlots.filter((slot) => slot.status === "occupied").length, icon: CarFront, style: "bg-red-50 text-red-700" },
    { label: "Reserved", value: liveSlots.filter((slot) => slot.status === "reserved").length, icon: CalendarClock, style: "bg-blue-50 text-blue-700" },
    { label: "Vehicles Today", value: 18, icon: Users, style: "bg-violet-50 text-violet-700" },
  ];

  return (
    <AdminShell>
      <main className="min-w-0">
        <Container className="py-7 sm:py-9 lg:py-10">
          <PageHeader title="Admin Dashboard" description="Monitor parking operations, reservations, and system health." action={<span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800"><span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />System Online</span>} />

          <section id="overview" className="mt-7 scroll-mt-6" aria-labelledby="overview-title">
            <h2 id="overview-title" className="sr-only">Overview</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">{metrics.map((item) => <Metric key={item.label} {...item} />)}</div>
          </section>

          <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
            <LiveParking slots={liveSlots} selectedId={selectedSlotId} onSelect={setSelectedSlotId} selectedSlot={selectedSlot} lateReservations={lateReservations} />
            <TodayReservations />
          </div>

          <LateReservations reservations={lateReservations} onUpdate={updateReservation} />

          <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
            <RecentActivity items={activity} />
            <SystemStatus />
          </div>
        </Container>
      </main>
    </AdminShell>
  );
}

function Metric({ label, value, icon: Icon, style }: { label: string; value: number; icon: LucideIcon; style: string }) {
  return <Card className="p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-slate-500">{label}</p><p className="mt-1.5 text-2xl font-bold text-slate-950">{value}</p></div><div className={cn("flex size-9 items-center justify-center rounded-lg", style)}><Icon className="size-4.5" aria-hidden="true" /></div></div></Card>;
}

function LiveParking({ slots, selectedId, onSelect, selectedSlot, lateReservations }: { slots: Array<{ id: string; label: string; status: ParkingSlotStatus }>; selectedId: string; onSelect: (id: string) => void; selectedSlot: { id: string; label: string; status: ParkingSlotStatus }; lateReservations: LateReservation[] }) {
  const active = lateReservations.find((item) => item.slotId === selectedSlot.id && item.status !== "released");
  return <section id="live-parking" className="scroll-mt-6" aria-labelledby="live-parking-title"><Card className="overflow-hidden"><CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-slate-200"><div><CardTitle id="live-parking-title" className="text-lg">Live Parking</CardTitle><p className="mt-1 text-sm text-slate-600">Select a slot to inspect its current state.</p></div><div className="text-right"><StatusBadge status="online" /><p className="mt-1 text-xs text-slate-500">Updated just now</p></div></CardHeader><CardContent className="bg-slate-50/65 p-4 sm:p-5"><div className="mb-4 flex items-center gap-3"><span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-600"><CarFront className="size-4" aria-hidden="true" />Entry</span><span className="h-px flex-1 border-t border-dashed border-slate-300" aria-hidden="true" /><Route className="size-4 text-slate-400" aria-hidden="true" /></div><div className="relative grid grid-cols-2 gap-3 sm:gap-x-8">{slots.map((slot) => <ParkingSlot key={slot.id} label={slot.label} status={slot.status} selected={selectedId === slot.id} onClick={() => onSelect(slot.id)} allowUnavailableSelection className="min-h-20 bg-white py-3 sm:min-h-24" />)}</div><div className="mt-4 flex flex-wrap justify-center gap-2 border-t border-slate-200 pt-4"><StatusBadge status="available" /><StatusBadge status="occupied" /><StatusBadge status="reserved" /></div><div className="mt-4 rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Selected Slot</p><h3 className="mt-1 font-mono text-xl font-bold">Slot {selectedSlot.label}</h3></div><StatusBadge status={selectedSlot.status} /></div>{active ? <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><Detail label="Booking ID" value={active.id} /><Detail label="User" value={active.userName} /><Detail label="Vehicle" value={active.id === "SP-1042" ? "MH 12 AB 4582" : "MH 04 AB 1234"} /><Detail label="Arrival" value={formatTime(active.expectedAt)} /><Detail label="Grace Until" value={formatTime(active.graceUntil)} /></dl> : <p className="mt-3 text-sm text-slate-600">No active reservation.</p>}</div></CardContent></Card></section>;
}

function TodayReservations() {
  return <section id="reservations" className="scroll-mt-6" aria-labelledby="reservations-title"><Card><CardHeader className="border-b border-slate-200"><CardTitle id="reservations-title" className="text-lg">Today&apos;s Reservations</CardTitle><p className="mt-1 text-sm text-slate-600">Four scheduled parking sessions.</p></CardHeader><CardContent className="divide-y divide-slate-100 px-5 pb-0 sm:px-6">{reservations.map((item) => <article key={item.id} className="py-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-950">{item.user}</p><p className="mt-0.5 font-mono text-xs text-slate-500">{item.vehicle}</p></div><ReservationBadge status={item.status} /></div><div className="mt-3 flex items-center justify-between text-sm"><span className="font-mono font-bold text-slate-800">{item.slot}</span><span className="text-slate-600">{item.time}</span></div></article>)}</CardContent></Card></section>;
}

function LateReservations({ reservations: items, onUpdate }: { reservations: LateReservation[]; onUpdate: (id: string, status: LateReservationStatus) => void }) {
  return <section id="late-reservations" className="mt-5 scroll-mt-6" aria-labelledby="late-title"><Card><CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-slate-200"><div><CardTitle id="late-title" className="text-lg">Late / At-Risk Reservations</CardTitle><p className="mt-1 text-sm text-slate-600">Review grace periods and extension requests.</p></div><span className="rounded-full bg-amber-100 px-2.5 py-1 text-sm font-bold text-amber-900">{items.filter((item) => item.status !== "released").length}</span></CardHeader><CardContent className="divide-y divide-slate-100 px-5 pb-0 sm:px-6">{items.map((item) => <article key={item.id} className="grid gap-3 py-4 lg:grid-cols-[1.1fr_.65fr_.8fr_.8fr_1fr_auto] lg:items-center"><div><p className="text-sm font-semibold">{item.userName}</p><p className="font-mono text-xs text-slate-500">{item.id}</p></div><p className="font-mono text-sm font-bold">{getSlotLabel(item.slotId)}</p><Detail label="Expected" value={formatTime(item.expectedAt)} /><Detail label="Grace Until" value={formatTime(item.graceUntil)} /><div><LateBadge status={item.status} />{item.status === "extension-requested" ? <p className="mt-1 text-xs font-medium text-amber-800">+{item.requestedExtensionMinutes} minutes requested</p> : null}{item.status === "extended" ? <p className="mt-1 text-xs font-medium text-emerald-700">Until 10:20 AM</p> : null}{item.status === "released" ? <p className="mt-1 text-xs font-medium text-red-700">Reservation Released</p> : null}</div><div className="flex flex-wrap gap-2 lg:justify-end">{item.status === "extension-requested" ? <><Button size="sm" onClick={() => onUpdate(item.id, "extended")}>Approve</Button><Button size="sm" variant="outline" onClick={() => onUpdate(item.id, "released")}>Decline</Button></> : null}{item.status === "grace-period" ? <Button size="sm" variant="destructive" onClick={() => onUpdate(item.id, "released")}>Release Slot</Button> : null}</div></article>)}</CardContent></Card></section>;
}

function RecentActivity({ items }: { items: AdminActivity[] }) {
  const extras: AdminActivity[] = [{ id: "extra-1", occurredAt: "2026-08-17T09:59:00+05:30", description: "Vehicle detected at entrance" }, { id: "extra-2", occurredAt: "2026-08-17T09:58:00+05:30", description: "Slot P2 occupied" }, { id: "extra-3", occurredAt: "2026-08-17T09:42:00+05:30", description: "Reservation SP-1040 completed" }];
  return <section id="activity" className="scroll-mt-6" aria-labelledby="activity-title"><Card><CardHeader className="flex flex-row items-center gap-3 border-b border-slate-200"><Activity className="size-5 text-slate-500" aria-hidden="true" /><div><CardTitle id="activity-title">Recent Activity</CardTitle><p className="mt-1 text-sm text-slate-600">Latest operational events.</p></div></CardHeader><CardContent className="divide-y divide-slate-100 px-5 pb-0 sm:px-6">{[...items, ...extras].slice(0, 5).map((item) => <div key={item.id} className="flex items-start gap-4 py-3.5"><time dateTime={item.occurredAt} className="shrink-0 font-mono text-xs font-semibold text-slate-500">{formatTime(item.occurredAt)}</time><span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500" aria-hidden="true" /><p className="text-sm text-slate-700">{item.description}</p></div>)}</CardContent></Card></section>;
}

function SystemStatus() {
  return <section id="system-status" className="scroll-mt-6" aria-labelledby="system-title"><Card><CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-slate-200"><div className="flex gap-3"><RadioTower className="mt-0.5 size-5 text-slate-500" aria-hidden="true" /><div><CardTitle id="system-title">IoT System Status</CardTitle><p className="mt-1 text-sm text-slate-600">Mock hardware health preview.</p></div></div><span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 sm:inline-flex">All Systems Normal</span></CardHeader><CardContent className="divide-y divide-slate-100 px-5 pb-0 sm:px-6">{systemDevices.map(([device, state]) => <div key={device} className="flex items-center justify-between gap-4 py-3"><div className="flex items-center gap-2.5"><span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" /><span className="text-sm font-medium text-slate-800">{device}</span></div><span className="text-xs font-semibold text-emerald-700">{state}</span></div>)}</CardContent></Card></section>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-0.5 text-sm font-semibold text-slate-800">{value}</dd></div>; }
function LateBadge({ status }: { status: LateReservationStatus }) { const style = lateStyles[status]; return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", style.className)}>{style.label}</span>; }
function ReservationBadge({ status }: { status: typeof reservations[number]["status"] }) { const classes = status === "Reserved" ? "border-blue-200 bg-blue-50 text-blue-800" : status === "Completed" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : status === "Expired" ? "border-red-200 bg-red-50 text-red-800" : "border-slate-200 bg-slate-100 text-slate-700"; return <span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", classes)}>{status}</span>; }
function getSlotLabel(slotId: string) { return mockParkingSlots.find((slot) => slot.id === slotId)?.label ?? slotId; }
function formatTime(value: string | Date) { return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).format(new Date(value)); }
