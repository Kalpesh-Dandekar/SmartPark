import {
  Activity,
  CarFront,
  LayoutDashboard,
  LogOut,
  RadioTower,
  TicketCheck,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";

import { Brand } from "@/components/shared/brand";

const items = [
  { label: "Overview", href: "#overview", icon: LayoutDashboard },
  { label: "Live Parking", href: "#live-parking", icon: CarFront },
  { label: "Reservations", href: "#reservations", icon: TicketCheck },
  { label: "Late / At-Risk", href: "#late-reservations", icon: TriangleAlert },
  { label: "Activity", href: "#activity", icon: Activity },
  { label: "System Status", href: "#system-status", icon: RadioTower },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-slate-950 px-4 py-5 text-white">
      <Link href="/admin/dashboard" onClick={onNavigate} aria-label="SmartPark Admin dashboard" className="w-fit rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-400/40">
        <Brand admin showTagline className="[&_span]:text-white [&_p]:text-slate-400" />
      </Link>

      <p className="mb-2 mt-8 px-3 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-500">Operations</p>
      <nav className="space-y-1" aria-label="Admin dashboard sections">
        {items.map((item, index) => {
          const Icon = item.icon;
          return <a key={item.href} href={item.href} onClick={onNavigate} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-400/35 ${index === 0 ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}><Icon className="size-4" aria-hidden="true" />{item.label}</a>;
        })}
      </nav>

      <div className="mt-auto border-t border-slate-800 pt-5">
        <div className="flex items-center gap-3 px-2"><div className="flex size-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold" aria-hidden="true">AU</div><div><p className="text-sm font-semibold">Admin User</p><p className="text-xs text-slate-400">Administrator</p></div></div>
        <Link href="/" onClick={onNavigate} className="mt-4 flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-400/35"><LogOut className="size-4" aria-hidden="true" />Log out</Link>
      </div>
    </div>
  );
}
