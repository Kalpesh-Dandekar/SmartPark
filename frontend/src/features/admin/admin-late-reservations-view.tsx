"use client";

import { Activity, CalendarClock, CarFront, CheckCircle2, CircleParking, History, RadioTower, Search, TimerOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { formatAdminDate, formatAdminDateTime, formatAdminTime } from "@/lib/admin-date";
import { expireReservation, getAdminDashboard, verifyReservationArrival } from "@/services/admin";
import type { AdminDashboardData, AdminReservation, ApiReservationStatus } from "@/types";

type Filter = "ALL" | Exclude<ApiReservationStatus, "ACTIVE">;
const filters: Filter[] = ["ALL", "BOOKED", "PARKED", "COMPLETED", "CANCELLED", "EXPIRED"];

export function AdminLateReservationsView() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => setData(await getAdminDashboard()), []);
  useEffect(() => { getAdminDashboard().then(setData).catch(() => setError("Unable to load live admin data.")); }, []);
  const reservations = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data?.reservations ?? []).filter((item) => (filter === "ALL" || item.status === filter) && (!needle || [item.userName, item.userEmail, item.vehicleNumber].some((value) => value.toLowerCase().includes(needle))));
  }, [data, filter, query]);
  async function expire(item: AdminReservation) {
    if (!window.confirm(`Expire the booked reservation for ${item.vehicleNumber}?`)) return;
    setBusyId(item.id); setError(""); setNotice("");
    try { await expireReservation(item.id); await load(); setNotice("Reservation expired and capacity refreshed."); }
    catch (value) { setError(value instanceof Error ? value.message : "Unable to expire reservation."); }
    finally { setBusyId(""); }
  }
  async function verifyArrival(item: AdminReservation) {
    setBusyId(item.id); setError(""); setNotice("");
    try {
      const result = await verifyReservationArrival(item.id);
      await load();
      setNotice(result.idempotent ? "Arrival was already verified for this reservation." : "Arrival verified. Waiting for parking hardware.");
    } catch (value) { setError(value instanceof Error ? value.message : "Unable to verify arrival."); }
    finally { setBusyId(""); }
  }
  const capacity = data?.capacity ?? { totalCapacity: 4, available: 4, reserved: 0, occupied: 0 };
  const counts = data?.counts ?? { booked: 0, parked: 0, completed: 0, completedToday: 0, cancelled: 0, expired: 0 };
  const metrics = [
    { label: "Total capacity", value: capacity.totalCapacity, icon: CircleParking, tone: "bg-slate-900 text-white" },
    { label: "Available now", value: capacity.available, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Reserved", value: capacity.reserved, icon: CalendarClock, tone: "bg-blue-50 text-blue-700" },
    { label: "Parked", value: capacity.occupied, icon: CarFront, tone: "bg-amber-50 text-amber-800" },
  ];
  return <AdminShell><main className="min-w-0"><Container className="py-7 sm:py-9 lg:py-10">
    <PageHeader title="Operations Dashboard" description="Monitor parking capacity, reservations, sessions, and connected-device activity." />
    {notice && <p role="status" className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
    {error && <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <section id="overview" className="mt-7 scroll-mt-6" aria-labelledby="overview-title"><div className="mb-4"><h2 id="overview-title" className="text-lg font-bold">Capacity overview</h2><p className="mt-1 text-sm text-slate-600">Live capacity derived from reservations and parking sessions—not physical slot assignments.</p></div><div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{metrics.map((item) => <Metric key={item.label} {...item} />)}</div><CapacityBar data={capacity} /></section>
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Reservation metrics"><SmallMetric label="Upcoming bookings" value={counts.booked} icon={CalendarClock} /><SmallMetric label="Currently parked" value={counts.parked} icon={CarFront} /><SmallMetric label="Completed today" value={counts.completedToday} icon={History} /><SmallMetric label="Expired bookings" value={counts.expired} icon={TimerOff} /></section>
    <section id="reservations" className="mt-6 scroll-mt-6" aria-labelledby="reservations-title"><Card><CardHeader className="border-b border-slate-200"><CardTitle id="reservations-title" className="text-lg">Reservation management</CardTitle><p className="mt-1 text-sm text-slate-600">Search and review the complete reservation lifecycle.</p><div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={cn("rounded-lg border px-3 py-2 text-xs font-semibold", filter === item ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50")}>{labelStatus(item)}</button>)}</div><label className="relative block lg:w-72"><span className="sr-only">Search reservations</span><Search className="absolute left-3 top-3 size-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email, or vehicle" className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15" /></label></div></CardHeader><CardContent className="p-0"><ReservationTable items={reservations} busyId={busyId} onExpire={(item) => void expire(item)} onVerifyArrival={(item) => void verifyArrival(item)} /></CardContent></Card></section>
    <div className="mt-6 grid gap-6 xl:grid-cols-2"><ActivityPanel items={data?.activity ?? []} /><DevicePanel device={data?.device ?? null} /></div>
  </Container></main></AdminShell>;
}

function Metric({ label, value, icon: Icon, tone }: { label: string; value: number; icon: LucideIcon; tone: string }) { return <Card className="p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div><div className={cn("flex size-10 items-center justify-center rounded-lg", tone)}><Icon className="size-5" /></div></div></Card>; }
function SmallMetric({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) { return <Card className="flex items-center gap-3 p-4"><div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><Icon className="size-4" /></div><div><p className="text-sm text-slate-600">{label}</p><p className="text-xl font-bold">{value}</p></div></Card>; }
function CapacityBar({ data }: { data: AdminDashboardData["capacity"] }) { const units = [...Array(data.available).fill("available"), ...Array(data.reserved).fill("reserved"), ...Array(data.occupied).fill("parked")]; return <Card className="mt-4 p-4 sm:p-5"><div className="flex items-center justify-between gap-4"><p className="text-sm font-semibold">Parking-space utilization</p><p className="text-sm text-slate-600">{data.available} of {data.totalCapacity} available</p></div><div className="mt-4 grid grid-cols-4 gap-2" aria-label={`${data.available} available, ${data.reserved} reserved, ${data.occupied} parked`}>{units.slice(0, data.totalCapacity).map((state, index) => <div key={index} className={cn("h-3 rounded-full", state === "available" ? "bg-emerald-500" : state === "reserved" ? "bg-blue-500" : "bg-amber-500")} title={labelStatus(state.toUpperCase())} />)}</div><div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600"><Legend color="bg-emerald-500" label="Available" /><Legend color="bg-blue-500" label="Reserved" /><Legend color="bg-amber-500" label="Parked" /></div></Card>; }
function Legend({ color, label }: { color: string; label: string }) { return <span className="flex items-center gap-2"><span className={cn("size-2 rounded-full", color)} />{label}</span>; }
function ReservationTable({ items, busyId, onExpire, onVerifyArrival }: { items: AdminReservation[]; busyId: string; onExpire: (item: AdminReservation) => void; onVerifyArrival: (item: AdminReservation) => void }) { if (!items.length) return <p className="p-8 text-center text-sm text-slate-600">No reservations match this view.</p>; return <div className="overflow-x-auto"><table className="w-full min-w-[1040px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">User</th><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Booking</th><th className="px-4 py-3">Duration</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Lifecycle time</th><th className="px-5 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{items.map((item) => <tr key={item.id} className="align-top"><td className="px-5 py-4"><p className="font-semibold">{item.userName}</p><p className="mt-1 max-w-56 break-all text-xs text-slate-500">{item.userEmail}</p></td><td className="px-4 py-4 font-mono font-semibold">{item.vehicleNumber}</td><td className="px-4 py-4"><p>{formatAdminDate(item.startAt ?? item.bookingDate)}</p><p className="mt-1 text-xs text-slate-500">{formatAdminTime(item.startAt)}–{formatAdminTime(item.endAt)}</p></td><td className="px-4 py-4">{item.durationMinutes} min</td><td className="px-4 py-4"><ReservationBadge status={item.status} />{item.arrivalState && item.arrivalState !== "CONFIRMED" && <p className="mt-2 text-xs font-semibold text-blue-700">{item.arrivalState === "AWAITING_HARDWARE" ? "Awaiting hardware" : "Parking detected"}</p>}</td><td className="px-4 py-4 text-xs text-slate-600">{lifecycleTime(item)}</td><td className="px-5 py-4"><div className="flex justify-end gap-2">{item.status === "BOOKED" ? <><Button size="sm" disabled={busyId === item.id || item.arrivalState === "PARKING_DETECTED"} onClick={() => onVerifyArrival(item)}>{busyId === item.id ? "Working…" : item.arrivalState === "AWAITING_HARDWARE" ? "Arrival Verified" : "Verify Arrival"}</Button><Button size="sm" variant="destructive" disabled={busyId === item.id} onClick={() => onExpire(item)}>Expire</Button></> : <span className="text-xs text-slate-400">No action</span>}</div></td></tr>)}</tbody></table></div>; }
function ReservationBadge({ status }: { status: ApiReservationStatus }) { const normalized = status === "ACTIVE" ? "BOOKED" : status; const style = normalized === "BOOKED" ? "border-blue-200 bg-blue-50 text-blue-800" : normalized === "PARKED" ? "border-amber-200 bg-amber-50 text-amber-800" : normalized === "COMPLETED" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-100 text-slate-700"; return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", style)}>{labelStatus(normalized)}</span>; }
function ActivityPanel({ items }: { items: AdminDashboardData["activity"] }) { return <section id="activity" className="scroll-mt-6"><Card><CardHeader className="flex flex-row items-center gap-3 border-b border-slate-200"><Activity className="size-5 text-slate-500" /><div><CardTitle>Recent activity</CardTitle><p className="mt-1 text-sm text-slate-600">Real reservation and parking lifecycle events.</p></div></CardHeader><CardContent className="divide-y divide-slate-100 px-5 pb-0 sm:px-6">{items.length ? items.slice(0, 8).map((item) => <div key={item.id} className="py-3.5"><p className="text-sm text-slate-700">{item.message}</p><time className="mt-1 block text-xs text-slate-500" dateTime={item.createdAt}>{formatAdminDateTime(item.createdAt)}</time></div>) : <p className="py-6 text-sm text-slate-600">No recent activity.</p>}</CardContent></Card></section>; }
function DevicePanel({ device }: { device: AdminDashboardData["device"] }) { return <section id="system-status" className="scroll-mt-6"><Card><CardHeader className="flex flex-row items-start gap-3 border-b border-slate-200"><RadioTower className="mt-0.5 size-5 text-slate-500" /><div><CardTitle>IoT device status</CardTitle><p className="mt-1 text-sm text-slate-600">Cloud telemetry is monitored separately from parking capacity.</p></div></CardHeader><CardContent className="p-5 sm:p-6">{device ? <dl className="grid gap-4 sm:grid-cols-3"><Info label="Device" value={device.deviceId} /><Info label="Recent device event" value={device.lastEventType === "PARKING_DETECTED" ? "Parking detected by hardware" : humanize(device.lastEventType)} /><Info label="Last activity" value={formatAdminDateTime(device.lastActivityAt)} /></dl> : <p className="text-sm text-slate-600">No recent IoT activity is available.</p>}</CardContent></Card></section>; }
function Info({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd></div>; }
function lifecycleTime(item: AdminReservation) { const value = item.completedAt ?? item.cancelledAt ?? item.expiredAt ?? item.parkedAt ?? item.bookedAt ?? item.createdAt; const label = item.completedAt ? "Completed" : item.cancelledAt ? "Cancelled" : item.expiredAt ? "Expired" : item.parkedAt ? "Parked" : "Booked"; return `${label} ${formatAdminDateTime(value)}`; }
function labelStatus(value: string) { return value === "ALL" ? "All" : value === "BOOKED" ? "Booked" : value === "PARKED" ? "Parked" : value.charAt(0) + value.slice(1).toLowerCase(); }
function humanize(value: string) { return value.replaceAll("_", " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase()); }
