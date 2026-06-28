"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  GitCompareArrows,
  FileText,
  Send,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResetDemoButton } from "@/components/shared/reset-demo-button";
import { IS_DEMO_MODE } from "@/lib/demo";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "New Inspection", href: "/inspections/new", icon: Plus },
  { name: "Comparison", href: "/comparison", icon: GitCompareArrows },
  { name: "Findings Report", href: "/report", icon: FileText },
  { name: "Correction Request", href: "/correction", icon: Send },
  { name: "Audit Trail", href: "/audit", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <ShieldCheck className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground">
          ProofCheck AI
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const enabledRoutes = ["/dashboard", "/inspections/new", "/comparison", "/report", "/correction", "/audit"];
          const isDisabled = !enabledRoutes.some(
            (r) => item.href === r || item.href.startsWith(r)
          );

          return (
            <Link
              key={item.name}
              href={isDisabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isDisabled && !isActive && "cursor-not-allowed opacity-50"
              )}
              aria-disabled={isDisabled}
              onClick={(e) => isDisabled && e.preventDefault()}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border px-4 py-3">
        {IS_DEMO_MODE && <ResetDemoButton />}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Prototype v0.1</p>
          {IS_DEMO_MODE && (
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-indigo-700">
              Demo
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
