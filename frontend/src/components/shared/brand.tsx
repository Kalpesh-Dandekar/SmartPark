import { CircleParking } from "lucide-react";

import { cn } from "@/lib/cn";

interface BrandProps {
  admin?: boolean;
  showTagline?: boolean;
  className?: string;
}

export function Brand({ admin = false, showTagline = false, className }: BrandProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex size-9 items-center justify-center rounded-lg bg-slate-900 text-white">
        <CircleParking className="size-5" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span>
        <span className="block text-base font-bold tracking-tight text-slate-950">
          SmartPark{admin ? " Admin" : ""}
        </span>
        {showTagline ? (
          <span className="block text-[0.6875rem] font-medium tracking-wide text-slate-500">
            Reserve. Arrive. Park.
          </span>
        ) : null}
      </span>
    </div>
  );
}
