"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { QueryProvider } from "@/lib/query-client";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryProvider>
      <div className="flex h-full">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-20 bg-black/40 sm:hidden"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — always visible sm+, overlay on mobile */}
        <div
          className={[
            "fixed inset-y-0 left-0 z-30 sm:static sm:z-auto sm:block",
            sidebarOpen ? "block" : "hidden sm:block",
          ].join(" ")}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-canvas p-7 sm:px-8">
            {children}
          </main>
        </div>
      </div>
    </QueryProvider>
  );
}
