"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  Columns2,
  FileText,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "New Inspection", href: "/inspections/new", icon: Plus },
  { name: "Comparison", href: "/comparison", icon: Columns2 },
  { name: "Findings Report", href: "/report", icon: FileText },
  { name: "Correction Request", href: "/correction", icon: Send },
  { name: "Audit Trail", href: "/audit", icon: ShieldCheck },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[216px] min-w-[216px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-[52px] items-center justify-between gap-2.5 border-b border-white/7 px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] bg-[#2d6be4]">
            <ShieldCheck className="h-3.5 w-3.5 text-white" strokeWidth={2.2} />
          </div>
          <span className="text-[13px] font-semibold tracking-tight text-white">
            ProofCheck AI
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-7 w-7 items-center justify-center rounded text-sidebar-foreground hover:bg-white/5 sm:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-px p-2">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const enabledRoutes = [
            "/dashboard",
            "/inspections/new",
            "/comparison",
            "/report",
            "/correction",
            "/audit",
          ];
          const isDisabled = !enabledRoutes.some(
            (r) => item.href === r || item.href.startsWith(r)
          );

          return (
            <Link
              key={item.name}
              href={isDisabled ? "#" : item.href}
              onClick={(e) => {
                if (isDisabled) e.preventDefault();
                else onClose?.();
              }}
              className={cn(
                "flex items-center gap-2.5 rounded px-2.5 py-2 text-[12.5px] font-medium transition-colors",
                isActive
                  ? "border-l-2 border-[#4a7cf7] bg-sidebar-accent pl-[calc(0.625rem-2px)] text-white"
                  : "border-l-2 border-transparent pl-2.5 text-[#8493a8] hover:bg-white/5 hover:text-[#c8d0dc]",
                isDisabled && !isActive && "cursor-not-allowed opacity-50"
              )}
              aria-disabled={isDisabled}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={isActive ? 2 : 1.75} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/6 px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#3e4a5e]">
          Pilot Workspace
        </p>
      </div>
    </aside>
  );
}
