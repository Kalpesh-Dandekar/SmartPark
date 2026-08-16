import { ArrowRight, CheckCircle2, Plus } from "lucide-react";

import { AdminHeader } from "@/components/layout/admin-header";
import { AppHeader } from "@/components/layout/app-header";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { ParkingSlot } from "@/components/shared/parking-slot";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockParkingSlots } from "@/data/mock";
import type { SmartParkStatus } from "@/types";

const previewStatuses: SmartParkStatus[] = [
  "available",
  "occupied",
  "reserved",
  "warning",
  "maintenance",
  "online",
  "offline",
  "completed",
  "cancelled",
  "expired",
];

export default function Home() {
  return (
    <div id="top" className="min-h-screen bg-slate-50">
      <PublicNavbar />

      <main>
        <Container className="py-10 sm:py-14 lg:py-16">
          <div className="mb-10 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <strong className="font-semibold">Internal preview:</strong> This page
            verifies the SmartPark design foundation and is not the product landing
            page.
          </div>

          <PageHeader
            title="SmartPark UI Foundation"
            description="Reusable, accessible interface patterns for the SmartPark mobility experience. Calm surfaces, clear status language, and responsive building blocks."
            action={
              <Button>
                Preview action
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            }
          />

          <Divider className="my-10" />

          <section id="components" aria-labelledby="buttons-heading">
            <SectionHeading
              id="buttons-heading"
              title="Buttons"
              description="Five purposeful variants with consistent sizing, focus, and disabled states."
            />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button>
                <Plus className="size-4" aria-hidden="true" />
                Primary
              </Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button disabled>Disabled</Button>
            </div>
          </section>

          <Divider className="my-10" />

          <section id="form-controls" aria-labelledby="inputs-heading">
            <SectionHeading
              id="inputs-heading"
              title="Form controls"
              description="Label, helper, validation, and disabled states sized for touch."
            />
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <Input
                label="Vehicle number"
                placeholder="MH 12 AB 4582"
                helperText="Use the number shown on the registration plate."
              />
              <Input
                label="Booking ID"
                defaultValue="BK-2026-1048"
                error="This booking has already expired."
              />
              <Input
                label="Assigned slot"
                defaultValue="P3"
                helperText="Automatically assigned"
                disabled
              />
            </div>
          </section>

          <Divider className="my-10" />

          <section aria-labelledby="statuses-heading">
            <SectionHeading
              id="statuses-heading"
              title="Status language"
              description="Every status combines restrained semantic color with a visible text label."
            />
            <div className="mt-5 flex flex-wrap gap-2.5">
              {previewStatuses.map((status) => (
                <StatusBadge key={status} status={status} />
              ))}
            </div>
          </section>

          <Divider className="my-10" />

          <section aria-labelledby="cards-heading">
            <SectionHeading
              id="cards-heading"
              title="Cards"
              description="Composable content surfaces that rely on borders and spacing instead of heavy elevation."
            />
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardDescription>Available now</CardDescription>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">18</p>
                </CardHeader>
                <CardFooter className="gap-2 text-sm text-emerald-800">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  Live slot count
                </CardFooter>
              </Card>
              <Card className="shadow-sm shadow-slate-200/60">
                <CardHeader>
                  <CardTitle>Active reservation</CardTitle>
                  <CardDescription>Today, 9:30 AM–11:30 AM</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                  <span className="font-mono text-lg font-semibold">BK-2026-1048</span>
                  <StatusBadge status="reserved" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Hardware connection</CardTitle>
                  <CardDescription>Parking controller SP-GATE-01</CardDescription>
                </CardHeader>
                <CardContent>
                  <StatusBadge status="online" />
                </CardContent>
              </Card>
            </div>
          </section>

          <Divider className="my-10" />

          <section id="parking-slots" aria-labelledby="parking-heading">
            <SectionHeading
              id="parking-heading"
              title="Parking slot states"
              description="A reusable signature element with typed states and selection-ready interaction."
            />
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {mockParkingSlots.map((slot, index) => (
                <ParkingSlot
                  key={slot.id}
                  label={slot.label}
                  status={slot.status}
                  selected={index === 0}
                />
              ))}
            </div>
            <div className="mt-3 max-w-[12rem]">
              <ParkingSlot label="P7" status="maintenance" />
            </div>
          </section>

          <Divider className="my-10" />

          <section aria-labelledby="headers-heading">
            <SectionHeading
              id="headers-heading"
              title="Application headers"
              description="Structural previews for future authenticated and administrative areas."
            />
            <div className="mt-5 space-y-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-3 sm:p-5">
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <AppHeader userName="Aarav Mehta" />
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-800">
                <AdminHeader />
              </div>
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}

interface SectionHeadingProps {
  id: string;
  title: string;
  description: string;
}

function SectionHeading({ id, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <h2 id={id} className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
        {title}
      </h2>
      <p className="mt-1.5 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
