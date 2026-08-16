"use client";

import { Wrench } from "lucide-react";

import { cn } from "@/lib/cn";
import { getParkingSlotStyle } from "@/lib/status";
import type { ParkingSlotStatus } from "@/types";

interface ParkingSlotProps {
  label: string;
  status: ParkingSlotStatus;
  selected?: boolean;
  onClick?: () => void;
  allowUnavailableSelection?: boolean;
  className?: string;
}

export function ParkingSlot({
  label,
  status,
  selected = false,
  onClick,
  allowUnavailableSelection = false,
  className,
}: ParkingSlotProps) {
  const style = getParkingSlotStyle(status);
  const interactive = Boolean(onClick) && (status === "available" || allowUnavailableSelection);
  const content = (
    <>
      <span className="font-mono text-lg font-bold tracking-tight">{label}</span>
      <span className="flex items-center gap-1.5 text-xs font-semibold">
        {status === "maintenance" ? (
          <Wrench className="size-3.5" aria-hidden="true" />
        ) : (
          <span className={cn("size-1.5 rounded-full", style.dot)} aria-hidden="true" />
        )}
        {style.label}
      </span>
    </>
  );
  const slotClasses = cn(
    "flex min-h-28 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 px-4 py-5 text-center transition-colors",
    style.slot,
    selected && "ring-3 ring-blue-600/25 ring-offset-2",
    interactive &&
      "cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/30 focus-visible:ring-offset-2",
    className,
  );

  if (interactive) {
    return (
      <button
        type="button"
        className={slotClasses}
        onClick={onClick}
        aria-pressed={selected}
        aria-label={`${style.label} parking slot ${label}${selected ? ", selected" : ""}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={slotClasses} aria-label={`${style.label} parking slot ${label}`}>
      {content}
    </div>
  );
}
