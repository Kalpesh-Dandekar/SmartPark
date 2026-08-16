import { cn } from "@/lib/cn";
import { statusStyles } from "@/lib/status";
import type { SmartParkStatus } from "@/types";

interface StatusBadgeProps {
  status: SmartParkStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        style.badge,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} aria-hidden="true" />
      {style.label}
    </span>
  );
}
