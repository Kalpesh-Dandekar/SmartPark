import {
  CalendarPlus,
  LayoutDashboard,
  LogOut,
  TicketCheck,
} from "lucide-react";
import Link from "next/link";

import { Brand } from "@/components/shared/brand";
import { cn } from "@/lib/cn";
import type { User } from "@/types";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, active: true },
  { label: "Book a Slot", href: "/book", icon: CalendarPlus, disabled: true },
  { label: "My Bookings", href: "/bookings", icon: TicketCheck, disabled: true },
];

interface AppSidebarProps {
  user: User;
  onNavigate?: () => void;
}

export function AppSidebar({ user, onNavigate }: AppSidebarProps) {
  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "U";

  return (
    <div className="flex h-full flex-col bg-white px-4 py-5">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        aria-label="SmartPark dashboard"
        className="w-fit rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25"
      >
        <Brand showTagline />
      </Link>

      <nav className="mt-9 space-y-1" aria-label="Application navigation">
        {navigation.map((item) => {
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <span
                key={item.label}
                aria-disabled="true"
                title="Coming in a future milestone"
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400"
              >
                <Icon className="size-4.5" aria-hidden="true" />
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25",
                item.active
                  ? "bg-slate-100 text-slate-950"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
              )}
            >
              <Icon
                className={cn("size-4.5", item.active && "text-blue-700")}
                aria-hidden="true"
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-200 pt-5">
        <div className="flex items-center gap-3 px-2">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-800 ring-1 ring-blue-100"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="mt-0.5 truncate font-mono text-xs text-slate-500">
              {user.vehicleNumber ?? "Vehicle not added"}
            </p>
          </div>
        </div>
        <Link
          href="/"
          onClick={onNavigate}
          className="mt-4 flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Log out
        </Link>
      </div>
    </div>
  );
}
