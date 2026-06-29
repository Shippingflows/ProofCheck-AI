"use client";

import { Bell, Menu } from "lucide-react";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header className="flex h-[58px] shrink-0 items-center justify-between border-b border-border bg-card px-5">
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent sm:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <b className="text-[15px] font-extrabold text-foreground">
            Supplier Proof Review Workspace
          </b>
          <span className="cockpit-pill cockpit-pill-blue hidden sm:inline-flex">
            PILOT · SAMPLE DATA
          </span>
          <span className="cockpit-pill hidden md:inline-flex">AI-assisted detection</span>
          <span className="cockpit-pill cockpit-pill-crit hidden lg:inline-flex">
            Human QA confirmation required
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2.5 font-bold text-[#475467]">
        <button
          className="relative flex h-8 w-8 items-center justify-center"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div className="grid h-7 w-7 place-items-center rounded-[3px] bg-[#111827] text-[11px] text-white">
          SC
        </div>
        <span className="hidden text-[13px] sm:inline">Sarah Chen</span>
      </div>
    </header>
  );
}
