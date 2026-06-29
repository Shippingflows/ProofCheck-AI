"use client";

import { Bell, User } from "lucide-react";

export function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-medium text-foreground">
          Supplier Proof Review Workspace
        </h1>
        <span className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground">
          Pilot Workspace · Sample Data
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>

        <div className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-medium text-foreground">Sarah Chen</span>
        </div>
      </div>
    </header>
  );
}
