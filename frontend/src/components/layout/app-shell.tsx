"use client";

import { Menu, X } from "lucide-react";
import { useRef, type ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Brand } from "@/components/shared/brand";
import type { User } from "@/types";

interface AppShellProps {
  user: User;
  children: ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const drawerRef = useRef<HTMLDialogElement>(null);

  function openDrawer() {
    drawerRef.current?.showModal();
  }

  function closeDrawer() {
    drawerRef.current?.close();
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <AppSidebar user={user} />
      </aside>

      <div className="min-w-0 flex-1 lg:pl-64">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:hidden">
          <Brand />
          <button
            type="button"
            onClick={openDrawer}
            className="flex size-11 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25"
            aria-label="Open application menu"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </header>

        {children}
      </div>

      <dialog
        ref={drawerRef}
        className="m-0 h-dvh w-[min(19rem,88vw)] max-h-none max-w-none border-0 bg-white p-0 shadow-2xl backdrop:bg-slate-950/35 lg:hidden"
        aria-label="Application menu"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeDrawer();
          }
        }}
      >
        <div className="relative h-full border-r border-slate-200">
          <button
            type="button"
            onClick={closeDrawer}
            autoFocus
            className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-lg bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25"
            aria-label="Close application menu"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          <AppSidebar user={user} onNavigate={closeDrawer} />
        </div>
      </dialog>
    </div>
  );
}
