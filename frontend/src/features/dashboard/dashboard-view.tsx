import {
  CalendarClock,
  CarFront,
  CheckCircle2,
  CircleParking,
  Clock3,
  MapPin,
  Route,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { ParkingSlot } from "@/components/shared/parking-slot";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  mockBookings,
  mockParkingActivity,
  mockParkingSlots,
  mockUser,
} from "@/data/mock";
import { cn } from "@/lib/cn";
import { statusStyles } from "@/lib/status";

const summaryItems: Array<{
  label: string;
  value: string;
  icon: LucideIcon;
  style: string;
}> = [
  {
    label: "Available",
    value: String(
      mockParkingSlots.filter((slot) => slot.status === "available").length,
    ),
    icon: CheckCircle2,
    style: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Occupied",
    value: String(
      mockParkingSlots.filter((slot) => slot.status === "occupied").length,
    ),
    icon: CarFront,
    style: "bg-red-50 text-red-700",
  },
  {
    label: "Reserved",
    value: String(
      mockParkingSlots.filter((slot) => slot.status === "reserved").length,
    ),
    icon: CalendarClock,
    style: "bg-blue-50 text-blue-700",
  },
  {
    label: "Total slots",
    value: String(mockParkingSlots.length),
    icon: CircleParking,
    style: "bg-slate-100 text-slate-700",
  },
];

export function DashboardView() {
  const firstName = mockUser.name.split(" ")[0];

  return (
    <AppShell user={mockUser}>
      <main className="min-w-0">
        <Container className="py-8 sm:py-10 lg:py-12">
          <PageHeader
            title="Dashboard"
            description={`Good evening, ${firstName}. Here's the current parking availability.`}
            action={
              <Link href="/book" className={buttonStyles()}>Book a Slot</Link>
            }
          />

          <section className="mt-8" aria-labelledby="parking-summary-title">
            <h2 id="parking-summary-title" className="sr-only">
              Parking summary
            </h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {summaryItems.map((item) => (
                <SummaryCard key={item.label} {...item} />
              ))}
            </div>
          </section>

          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.75fr)]">
            <LiveParking />
            <UpcomingBooking />
          </div>

          <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
            <RecentActivity />
            <QuickBooking />
          </div>
        </Container>
      </main>
    </AppShell>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  style,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  style: string;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", style)}>
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}

function LiveParking() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-slate-200">
        <div>
          <CardTitle className="text-lg">Live Parking</CardTitle>
          <p className="mt-1 text-sm text-slate-600">Current parking slot availability.</p>
        </div>
        <div className="shrink-0 text-right">
          <StatusBadge status="online" />
          <p className="mt-1.5 text-xs text-slate-500">Updated just now</p>
        </div>
      </CardHeader>

      <CardContent className="bg-surface-subtle/55 p-4 sm:p-6">
        <div className="mb-5 flex items-center gap-3" aria-label="Parking entry lane">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-600">
            <CarFront className="size-4" aria-hidden="true" />
            Entry
          </div>
          <div className="h-px flex-1 border-t border-dashed border-slate-300" aria-hidden="true" />
          <Route className="size-4 text-slate-400" aria-hidden="true" />
        </div>

        <div className="relative">
          <div
            className="absolute bottom-0 left-1/2 top-0 hidden -translate-x-1/2 border-l border-dashed border-slate-300 sm:block"
            aria-hidden="true"
          />
          <div className="relative grid grid-cols-2 gap-x-5 gap-y-3 sm:gap-x-10 sm:gap-y-4">
            {mockParkingSlots.map((slot) => (
              <ParkingSlot
                key={slot.id}
                label={slot.label}
                status={slot.status}
                className="min-h-24 bg-white px-2 py-4 sm:min-h-28"
              />
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 pt-4">
          <StatusBadge status="available" />
          <StatusBadge status="occupied" />
          <StatusBadge status="reserved" />
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingBooking() {
  const booking = mockBookings.find((item) => item.status === "reserved");

  if (!booking) {
    return null;
  }

  const graceDeadline = new Date(new Date(booking.startsAt).getTime() + 10 * 60 * 1000);

  return (
    <Card>
      <CardHeader className="border-b border-slate-200">
        <CardTitle>Upcoming Booking</CardTitle>
        <p className="mt-1 text-sm text-slate-600">Your next reserved parking session.</p>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              Assigned slot
            </p>
            <p className="mt-1 font-mono text-3xl font-bold tracking-tight text-slate-950">
              {getSlotLabel(booking.slotId)}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <dl className="mt-6 space-y-4 border-y border-slate-200 py-5">
          <BookingDetail icon={CalendarClock} label="Date" value={formatDate(booking.startsAt)} />
          <BookingDetail
            icon={Clock3}
            label="Time"
            value={`${formatTime(booking.startsAt)} – ${formatTime(booking.endsAt)}`}
          />
          <BookingDetail icon={CarFront} label="Vehicle" value={booking.vehicleNumber} />
        </dl>

        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-800">
            Arrive before
          </p>
          <p className="mt-1 text-lg font-bold text-slate-950">{formatTime(graceDeadline)}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Includes a 10-minute arrival grace period.
          </p>
        </div>

        <Link href="/bookings" className={buttonStyles({ variant: "outline", className: "mt-5 w-full" })}>
          View Booking
        </Link>
      </CardContent>
    </Card>
  );
}

function BookingDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
      <div>
        <dt className="text-xs font-medium text-slate-500">{label}</dt>
        <dd className="mt-0.5 text-sm font-semibold text-slate-800">{value}</dd>
      </div>
    </div>
  );
}

function RecentActivity() {
  return (
    <Card>
      <CardHeader className="border-b border-slate-200">
        <CardTitle>Recent Activity</CardTitle>
        <p className="mt-1 text-sm text-slate-600">Latest parking and reservation updates.</p>
      </CardHeader>
      <CardContent className="divide-y divide-slate-100 px-5 pb-0 sm:px-6">
        {mockParkingActivity.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 py-4 first:pt-5 last:pb-5">
            <span
              className={cn("mt-1.5 size-2 shrink-0 rounded-full", statusStyles[activity.status].dot)}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                <time
                  dateTime={activity.occurredAt}
                  className="shrink-0 font-mono text-xs text-slate-500"
                >
                  {formatTime(activity.occurredAt)}
                </time>
              </div>
              <p className="mt-1 text-sm leading-5 text-slate-600">{activity.description}</p>
              <span className="sr-only">Status: {statusStyles[activity.status].label}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function QuickBooking() {
  return (
    <Card className="bg-slate-900 text-white">
      <CardContent className="flex h-full flex-col justify-between p-6 sm:p-7">
        <div>
          <div className="flex size-11 items-center justify-center rounded-lg bg-white/10 text-white">
            <MapPin className="size-5" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-xl font-bold tracking-tight">Need parking?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Reserve a slot before you arrive and skip the search.
          </p>
        </div>
        <Link href="/book" className={buttonStyles({ variant: "outline", className: "mt-7 w-full border-white bg-white text-slate-950 hover:border-slate-200 hover:bg-slate-100" })}>
          Book a Slot
        </Link>
      </CardContent>
    </Card>
  );
}

function getSlotLabel(slotId: string): string {
  return mockParkingSlots.find((slot) => slot.id === slotId)?.label ?? slotId;
}

function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function formatTime(value: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}
