"use client";

import { Menu, X } from "lucide-react";
import { useRef, type ReactNode } from "react";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Brand } from "@/components/shared/brand";

export function AdminShell({ children }: { children: ReactNode }) {
  const drawerRef = useRef<HTMLDialogElement>(null);
  const closeDrawer = () => drawerRef.current?.close();

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-slate-950 lg:block"><AdminSidebar /></aside>
      <div className="min-w-0 flex-1 lg:pl-64">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:hidden"><Brand admin /><button type="button" onClick={() => drawerRef.current?.showModal()} aria-label="Open admin menu" className="flex size-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25"><Menu className="size-5" aria-hidden="true" /></button></header>
        {children}
      </div>
      <dialog ref={drawerRef} aria-label="Admin menu" className="m-0 h-dvh w-[min(19rem,88vw)] max-h-none max-w-none border-0 bg-slate-950 p-0 shadow-2xl backdrop:bg-slate-950/40 lg:hidden" onClick={(event) => { if (event.target === event.currentTarget) closeDrawer(); }}>
        <div className="relative h-full"><button type="button" onClick={closeDrawer} autoFocus aria-label="Close admin menu" className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-400/35"><X className="size-5" aria-hidden="true" /></button><AdminSidebar onNavigate={closeDrawer} /></div>
      </dialog>
    </div>
  );
}
