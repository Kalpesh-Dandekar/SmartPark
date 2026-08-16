import { Brand } from "@/components/shared/brand";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/cn";
import type { NavigationItem } from "@/types";

const defaultItems: NavigationItem[] = [
  { label: "Dashboard", href: "#" },
  { label: "Reservations", href: "#" },
];

interface AdminHeaderProps {
  items?: NavigationItem[];
}

export function AdminHeader({ items = defaultItems }: AdminHeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950 text-white">
      <Container className="flex min-h-16 flex-wrap items-center justify-between gap-x-5 gap-y-2 py-2">
        <Brand admin className="[&_span]:text-white" />
        <nav className="flex items-center gap-1" aria-label="Admin navigation">
          {items.map((item) => (
            <a
              key={item.label}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-400/35",
                item.active && "bg-slate-800 text-white",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </Container>
    </header>
  );
}
