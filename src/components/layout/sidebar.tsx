"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "New Inspection", href: "/inspections/new" },
  { name: "Comparison Workspace", href: "/comparison" },
  { name: "Findings Register", href: "/report" },
  { name: "Supplier Corrections", href: "/correction" },
  { name: "Audit Trail", href: "/audit" },
];

const controlNav = [
  { name: "QA Profiles", href: "/pilot-controls" },
  { name: "Supplier Records", href: "/pilot-controls" },
  { name: "Audit Exports", href: "/audit" },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="flex h-full w-[238px] min-w-[238px] shrink-0 flex-col border-r border-[#111f33] bg-gradient-to-b from-[#07111f] to-[#050b14] px-3.5 py-[18px] text-[#d7dde8]">
      <div className="mb-[26px] flex items-center gap-2.5">
        <div className="grid h-[30px] w-[30px] place-items-center border border-[#28508a] bg-[#10233b] text-sm font-black text-[#93c5fd]">
          ✓
        </div>
        <span className="text-[15px] font-extrabold text-white">ProofCheck AI</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="ml-auto flex h-7 w-7 items-center justify-center rounded text-[#a8b3c7] hover:bg-white/5 sm:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="grid gap-1">
        {mainNav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => onClose?.()}
              className={cn(
                "rounded-[3px] px-[11px] py-2.5 text-[13px] font-semibold no-underline transition-colors",
                active
                  ? "bg-[#122846] text-white shadow-[inset_3px_0_0_#60a5fa]"
                  : "text-[#a8b3c7] hover:bg-white/5 hover:text-white"
              )}
            >
              {item.name}
            </Link>
          );
        })}

        <div className="cockpit-label mx-[11px] mb-1.5 mt-[18px]">Controls</div>
        {controlNav.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => onClose?.()}
            className="rounded-[3px] px-[11px] py-2.5 text-[13px] font-semibold text-[#a8b3c7] no-underline hover:bg-white/5 hover:text-white"
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t border-[#152842] pt-3.5">
        <p className="cockpit-tiny text-[#7f8da5]">
          PILOT WORKSPACE
          <br />
          Synthetic medical-label sample
          <br />
          No autonomous disposition
        </p>
      </div>
    </aside>
  );
}
