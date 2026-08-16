"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Brand } from "@/components/shared/brand";
import { Container } from "@/components/layout/container";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { NavigationItem } from "@/types";

const defaultItems: NavigationItem[] = [
  { label: "Home", href: "#top", active: true },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Login", href: "#get-started" },
];

interface PublicNavbarProps {
  items?: NavigationItem[];
  ctaHref?: string;
}

export function PublicNavbar({
  items = defaultItems,
  ctaHref = "#get-started",
}: PublicNavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <a href="#top" aria-label="SmartPark home">
            <Brand />
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Public navigation">
            {items.map((item) => (
              <a
                key={item.label}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25",
                  item.active && "text-slate-950",
                )}
              >
                {item.label}
              </a>
            ))}
            <a
              href={ctaHref}
              className={buttonStyles({ size: "sm", className: "ml-2" })}
            >
              Get Started
            </a>
          </nav>

          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25 md:hidden"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="public-mobile-navigation"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>

        <nav
          id="public-mobile-navigation"
          aria-label="Mobile public navigation"
          className={cn("border-t border-slate-100 py-3 md:hidden", !open && "hidden")}
        >
          <div className="flex flex-col gap-1">
            {items.map((item) => (
              <a
                key={item.label}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25"
              >
                {item.label}
              </a>
            ))}
            <a
              href={ctaHref}
              onClick={() => setOpen(false)}
              className={buttonStyles({ className: "mt-2" })}
            >
              Get Started
            </a>
          </div>
        </nav>
      </Container>
    </header>
  );
}
