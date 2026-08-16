import { ArrowLeft, Radio } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { Brand } from "@/components/shared/brand";
import { ParkingSlot } from "@/components/shared/parking-slot";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockParkingSlots } from "@/data/mock";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-background py-6 sm:py-10 lg:flex lg:items-center lg:py-12">
      <Container className="max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            aria-label="Return to SmartPark home"
            className="rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25"
          >
            <Brand showTagline />
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back to home</span>
          </Link>
        </div>

        <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
          <section className="px-5 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16" aria-labelledby="auth-heading">
            <div className="mx-auto max-w-md">
              <h1 id="auth-heading" className="text-3xl font-bold tracking-tight text-slate-950">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                {description}
              </p>
              <div className="mt-8">{children}</div>
              <div className="mt-7 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
                {footer}
              </div>
            </div>
          </section>

          <AuthParkingPanel />
        </div>
      </Container>
    </main>
  );
}

function AuthParkingPanel() {
  return (
    <aside className="border-t border-slate-200 bg-surface-subtle/65 p-5 sm:p-8 lg:border-l lg:border-t-0 lg:p-10" aria-label="SmartPark parking preview">
      <div className="mx-auto flex h-full max-w-md flex-col justify-center">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-blue-700">SMARTPARK</p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
              Parking, already sorted.
            </h2>
          </div>
          <StatusBadge status="online" />
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Check availability and reserve your space before the drive.
        </p>

        <Card className="mt-7 overflow-hidden shadow-sm shadow-slate-900/5">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
            <div className="flex items-center gap-2">
              <Radio className="size-4 text-emerald-600" aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-900">Parking snapshot</p>
            </div>
            <span className="text-xs text-slate-500">Sample data</span>
          </div>
          <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-3 sm:p-4">
            {mockParkingSlots.slice(0, 4).map((slot) => (
              <ParkingSlot
                key={slot.id}
                label={slot.label}
                status={slot.status}
                className="min-h-20 bg-white px-2 py-3"
              />
            ))}
          </div>
          <div className="grid grid-cols-3 border-t border-slate-200 bg-white text-center">
            <PanelMetric value="3" label="Available" className="text-emerald-700" />
            <PanelMetric value="2" label="Occupied" className="border-x border-slate-200 text-red-700" />
            <PanelMetric value="1" label="Reserved" className="text-blue-700" />
          </div>
        </Card>
      </div>
    </aside>
  );
}

function PanelMetric({ value, label, className }: { value: string; label: string; className: string }) {
  return (
    <div className={`px-2 py-3 ${className}`}>
      <p className="text-base font-bold">{value}</p>
      <p className="text-[0.6875rem] font-medium text-slate-500">{label}</p>
    </div>
  );
}
