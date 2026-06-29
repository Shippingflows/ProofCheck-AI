"use client";

import { Bell, Menu } from "lucide-react";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent sm:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <h1 className="truncate text-[13px] font-medium text-foreground">
          Supplier Proof Review Workspace
        </h1>
        <span className="hidden shrink-0 rounded-full border border-border bg-canvas px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground sm:inline">
          Pilot · Sample Data
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent"
          aria-label="Notifications"
        >
          <Bell className="h-[15px] w-[15px]" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border-[1.5px] border-card bg-[#e55353]" />
        </button>

        <div className="flex items-center gap-1.5 rounded border border-border py-1 pl-1.5 pr-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eef3ff] text-[10px] font-bold text-[#2d6be4]">
            SC
          </div>
          <span className="hidden text-[12.5px] font-medium text-foreground sm:inline">
            Sarah Chen
          </span>
        </div>
      </div>
    </header>
  );
}
