import {
  ArrowRight,
  CalendarCheck2,
  CarFront,
  CheckCircle2,
  CircleParking,
  Clock3,
  Grid2X2Check,
  MapPin,
  Navigation,
  Radar,
  Route,
  TimerReset,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Brand } from "@/components/shared/brand";
import { ParkingSlot } from "@/components/shared/parking-slot";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockParkingSlots } from "@/data/mock";
import { cn } from "@/lib/cn";
import { statusStyles } from "@/lib/status";

const metrics = [
  {
    value: "6",
    label: "Total slots",
    color: "text-slate-950",
    icon: CircleParking,
    iconStyle: "bg-slate-100 text-slate-700",
  },
  {
    value: "3",
    label: "Available",
    color: "text-emerald-700",
    icon: CheckCircle2,
    iconStyle: "bg-emerald-50 text-emerald-700",
  },
  {
    value: "2",
    label: "Occupied",
    color: "text-red-700",
    icon: CarFront,
    iconStyle: "bg-red-50 text-red-700",
  },
  {
    value: "1",
    label: "Reserved",
    color: "text-blue-700",
    icon: CalendarCheck2,
    iconStyle: "bg-blue-50 text-blue-700",
  },
];

const heroIndicators = [
  { label: "Real-time availability", dot: "bg-emerald-500" },
  { label: "Advance reservations", dot: "bg-blue-500" },
  { label: "IoT-connected parking", dot: "bg-amber-500" },
];

const steps = [
  {
    number: "01",
    title: "Reserve",
    description: "Choose your date, arrival time, and an available parking slot.",
    icon: CalendarCheck2,
  },
  {
    number: "02",
    title: "Arrive",
    description: "Reach the parking facility within your reservation grace period.",
    icon: Navigation,
  },
  {
    number: "03",
    title: "Park",
    description:
      "Your assigned slot is ready and live parking status updates automatically.",
    icon: CircleParking,
  },
];

const benefits = [
  {
    title: "Save time",
    description: "Know your parking slot before reaching the destination.",
    icon: Clock3,
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Reduce uncertainty",
    description: "Live availability means less circling and unnecessary searching.",
    icon: Radar,
    accent: "bg-blue-50 text-blue-700",
  },
  {
    title: "Better utilization",
    description: "Reserved, occupied, and available slots stay clearly managed.",
    icon: Grid2X2Check,
    accent: "bg-amber-50 text-amber-800",
  },
];

export default function Home() {
  return (
    <div id="top" className="min-h-screen overflow-x-clip bg-background">
      <PublicNavbar />

      <main>
        <Hero />
        <LiveParkingSummary />
        <HowItWorks />
        <Benefits />
        <GracePeriodCallout />
        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section
      className="relative border-b border-slate-200 bg-surface-subtle/60"
      aria-labelledby="hero-title"
    >
      <Container className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-24 xl:py-28">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-[0.18em] text-blue-700 sm:text-sm">
            SMARTER PARKING, BEFORE YOU ARRIVE
          </p>
          <h1
            id="hero-title"
            className="mt-5 text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-6xl"
          >
            Reserve your parking before the drive.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            See live parking availability, reserve a slot in advance, and arrive
            knowing your space is waiting.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#live-parking" className={buttonStyles({ size: "lg" })}>
              Reserve a Slot
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a
              href="#live-parking"
              className={buttonStyles({ variant: "outline", size: "lg" })}
            >
              View Live Parking
            </a>
          </div>

          <ul className="mt-8 flex flex-col gap-3 text-sm font-medium text-slate-600 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {heroIndicators.map((item) => (
                <li key={item.label} className="flex items-center gap-2">
                  <span className={cn("size-1.5 rounded-full", item.dot)} aria-hidden="true" />
                  {item.label}
                </li>
              ))}
          </ul>
        </div>

        <ParkingPreview />
      </Container>
    </section>
  );
}

function ParkingPreview() {
  return (
    <div className="relative mx-auto w-full max-w-2xl lg:mx-0">
      <div
        className="absolute -inset-4 rounded-[1.5rem] bg-slate-200/55 sm:-inset-6"
        aria-hidden="true"
      />
      <Card className="relative overflow-hidden border-slate-200/90 bg-surface shadow-2xl shadow-slate-900/10">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-slate-500" aria-hidden="true" />
              <h2 className="font-semibold text-slate-950">Live Parking</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">SmartPark Central · Ground level</p>
          </div>
          <div className="text-right">
            <StatusBadge status="online" />
            <p className="mt-1.5 text-xs text-slate-500">Updated just now</p>
          </div>
        </div>

        <div className="bg-surface-subtle/55 p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-3" aria-label="Parking entrance">
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600">
              <CarFront className="size-3.5" aria-hidden="true" />
              Entrance
            </div>
            <div className="h-px flex-1 border-t border-dashed border-slate-300" aria-hidden="true" />
            <Route className="size-4 text-slate-400" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {mockParkingSlots.map((slot) => (
              <ParkingSlot
                key={slot.id}
                label={slot.label}
                status={slot.status}
                className="min-h-24 bg-white/80 px-2 py-4 sm:min-h-28"
              />
            ))}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-200 pt-4 text-center">
            <PreviewCount label="Available" value="3" status="available" />
            <PreviewCount label="Occupied" value="2" status="occupied" />
            <PreviewCount label="Reserved" value="1" status="reserved" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function PreviewCount({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "available" | "occupied" | "reserved";
}) {
  return (
    <div>
      <p className="text-lg font-bold text-slate-950">{value}</p>
      <p className="mt-0.5 flex items-center justify-center gap-1.5 text-[0.6875rem] font-medium text-slate-500 sm:text-xs">
        <span className={cn("size-1.5 rounded-full", statusStyles[status].dot)} aria-hidden="true" />
        {label}
      </p>
    </div>
  );
}

function LiveParkingSummary() {
  return (
    <section
      id="live-parking"
      className="border-b border-slate-200 bg-surface-subtle/60"
      aria-label="Live parking summary"
    >
      <Container className="py-6 sm:py-8">
        <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-surface shadow-sm shadow-slate-900/5 sm:grid-cols-4">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={cn(
                "flex items-center justify-center gap-3 px-4 py-5 text-left sm:border-b-0 sm:border-r sm:px-6 sm:last:border-r-0",
                index < 2 && "border-b border-slate-200",
                index % 2 === 0 && "border-r border-slate-200",
              )}
            >
              <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", metric.iconStyle)}>
                <metric.icon className="size-4" aria-hidden="true" />
              </div>
              <div>
                <p className={`text-2xl font-bold tracking-tight ${metric.color}`}>{metric.value}</p>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">{metric.label}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-b border-slate-200 bg-surface py-20 sm:py-24"
      aria-labelledby="how-title"
    >
      <Container>
        <SectionIntro
          eyebrow="A SIMPLE ROUTE TO YOUR SPACE"
          title="Parking in three simple steps."
          description="From checking availability to pulling into your slot, SmartPark keeps the journey clear."
          titleId="how-title"
        />

        <ol className="relative mt-12 grid gap-5 md:grid-cols-3 md:gap-0">
          <div
            className="absolute left-[16.67%] right-[16.67%] top-7 hidden border-t border-dashed border-slate-300 md:block"
            aria-hidden="true"
          />
          {steps.map((step) => (
            <li key={step.number} className="relative md:px-5 lg:px-8">
              <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 md:block md:border-0 md:bg-transparent md:p-0 md:text-center">
                <div className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700 shadow-sm md:mx-auto">
                  <step.icon className="size-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 md:mt-6">
                  <p className="font-mono text-xs font-bold tracking-wider text-blue-700">{step.number}</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-950">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

function Benefits() {
  return (
    <section
      className="bg-surface-subtle/60 py-20 sm:py-24"
      aria-labelledby="benefits-title"
    >
      <Container>
        <SectionIntro
          eyebrow="LESS SEARCHING. MORE CERTAINTY."
          title="A better way to arrive."
          description="SmartPark removes the uncertainty between reaching your destination and finding a place to park."
          titleId="benefits-title"
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {benefits.map((benefit) => (
            <Benefit key={benefit.title} {...benefit} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function Benefit({
  title,
  description,
  icon: Icon,
  accent,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-surface p-6">
      <div className={cn("flex size-11 items-center justify-center rounded-lg", accent)}>
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}

function GracePeriodCallout() {
  return (
    <section className="bg-surface-subtle/60 pb-20 sm:pb-24" aria-labelledby="grace-title">
      <Container>
        <div className="flex flex-col gap-5 rounded-xl border border-amber-200 bg-amber-50/70 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
            <TimerReset className="size-6" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
              Built-in arrival flexibility
            </p>
            <h2 id="grace-title" className="mt-2 text-xl font-bold tracking-tight text-slate-950">
              Your slot stays reserved for a configurable grace period.
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Running late? Manage your reservation before it is released automatically.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FinalCta() {
  return (
    <section
      id="get-started"
      className="scroll-mt-20 bg-background py-20 sm:py-24"
      aria-labelledby="cta-title"
    >
      <Container>
        <div className="rounded-2xl bg-slate-900 px-6 py-12 text-center text-white sm:px-10 sm:py-16">
          <h2 id="cta-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your parking spot should be the easy part.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300">
            Check availability, reserve ahead, and park with confidence.
          </p>
          <a
            href="#live-parking"
            className={buttonStyles({
              variant: "outline",
              size: "lg",
              className: "mt-8 border-white bg-white text-slate-950 hover:border-slate-200 hover:bg-slate-100",
            })}
          >
            Get Started
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </Container>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <Container className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Brand showTagline />
          <p className="mt-3 text-xs text-slate-500">© 2026 SmartPark</p>
        </div>
        <p className="text-sm text-slate-500">Smart Parking Reservation &amp; Management</p>
      </Container>
    </footer>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  titleId,
}: {
  eyebrow: string;
  title: string;
  description: string;
  titleId: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold tracking-[0.16em] text-blue-700">{eyebrow}</p>
      <h2 id={titleId} className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
    </div>
  );
}
