import { Brand } from "@/components/shared/brand";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/cn";
import type { NavigationItem } from "@/types";

const defaultItems: NavigationItem[] = [
  { label: "Dashboard", href: "#" },
  { label: "Book Slot", href: "#" },
  { label: "My Bookings", href: "#" },
];

interface AppHeaderProps {
  userName: string;
  items?: NavigationItem[];
}

export function AppHeader({ userName, items = defaultItems }: AppHeaderProps) {
  const initial = userName.trim().charAt(0).toUpperCase() || "U";

  return (
    <header className="border-b border-slate-200 bg-white">
      <Container className="flex min-h-16 flex-wrap items-center justify-between gap-x-5 gap-y-2 py-2">
        <Brand />
        <nav
          className="order-3 flex w-full gap-1 overflow-x-auto sm:order-2 sm:w-auto"
          aria-label="User navigation"
        >
          {items.map((item) => (
            <a
              key={item.label}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25",
                item.active && "bg-slate-100 text-slate-950",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div
          className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-800 ring-1 ring-blue-100"
          aria-label={`Signed in as ${userName}`}
          title={userName}
        >
          {initial}
        </div>
      </Container>
    </header>
  );
}
