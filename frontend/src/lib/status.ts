import type { ParkingSlotStatus, SmartParkStatus } from "@/types";

interface StatusStyle {
  label: string;
  badge: string;
  dot: string;
  slot: string;
}

export const statusStyles: Record<SmartParkStatus, StatusStyle> = {
  available: {
    label: "Available",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-500",
    slot:
      "border-emerald-300 bg-emerald-50/70 text-emerald-950 hover:border-emerald-400 hover:bg-emerald-50",
  },
  occupied: {
    label: "Occupied",
    badge: "border-red-200 bg-red-50 text-red-800",
    dot: "bg-red-500",
    slot: "border-red-200 bg-red-50/70 text-red-950",
  },
  reserved: {
    label: "Reserved",
    badge: "border-blue-200 bg-blue-50 text-blue-800",
    dot: "bg-blue-500",
    slot: "border-blue-200 bg-blue-50/70 text-blue-950",
  },
  warning: {
    label: "Warning",
    badge: "border-amber-200 bg-amber-50 text-amber-900",
    dot: "bg-amber-500",
    slot: "border-amber-200 bg-amber-50/70 text-amber-950",
  },
  maintenance: {
    label: "Maintenance",
    badge: "border-amber-200 bg-amber-50 text-amber-900",
    dot: "bg-amber-500",
    slot: "border-amber-200 bg-amber-50/70 text-amber-950",
  },
  online: {
    label: "Online",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-500",
    slot: "border-emerald-200 bg-emerald-50 text-emerald-950",
  },
  offline: {
    label: "Offline",
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
    slot: "border-slate-200 bg-slate-100 text-slate-700",
  },
  completed: {
    label: "Completed",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-500",
    slot: "border-emerald-200 bg-emerald-50 text-emerald-950",
  },
  cancelled: {
    label: "Cancelled",
    badge: "border-red-200 bg-red-50 text-red-800",
    dot: "bg-red-500",
    slot: "border-red-200 bg-red-50 text-red-950",
  },
  expired: {
    label: "Expired",
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
    slot: "border-slate-200 bg-slate-100 text-slate-700",
  },
};

export function getParkingSlotStyle(status: ParkingSlotStatus): StatusStyle {
  return statusStyles[status];
}
