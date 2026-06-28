"use client";

import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { QueryProvider } from "@/lib/query-client";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="flex h-full">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto bg-background p-6">
            {children}
          </main>
        </div>
      </div>
    </QueryProvider>
  );
}
