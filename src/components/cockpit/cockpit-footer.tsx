"use client";

import Link from "next/link";
import { Finding } from "@/domain/models";
import { FindingSeverity } from "@/domain/enums";
import { cn } from "@/lib/utils";

interface CockpitFooterProps {
  findings: Finding[];
}

export function CockpitFooter({ findings }: CockpitFooterProps) {
  const criticalOpen = findings.filter(
    (f) => f.severity === FindingSeverity.Critical
  ).length;

  const checks = [
    { label: "Text content reviewed", done: true },
    { label: "Barcode decoded", done: true },
    { label: "Symbols pending", done: false },
    { label: `Critical findings unresolved: ${criticalOpen}`, done: false },
    { label: "Supplier correction not sent", done: false },
    { label: "Final decision blocked", done: false },
  ];

  return (
    <div className="sticky bottom-0 mt-3 grid grid-cols-1 items-center gap-3.5 border border-border bg-card p-3 shadow-[0_-10px_30px_rgba(16,24,40,0.08)] lg:grid-cols-[1fr_auto]">
      <div>
        <b className="text-[13px]">Reviewer checklist</b>
        <div className="mt-2 flex flex-wrap gap-2">
          {checks.map((check) => (
            <span
              key={check.label}
              className={cn(
                "font-mono text-[10px] border border-border bg-[#f8fafc] px-[7px] py-[5px]",
                check.done && "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]"
              )}
            >
              {check.label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="cockpit-btn">
          Save Review State
        </button>
        <Link href="/report" className="cockpit-btn cockpit-btn-primary no-underline">
          View Findings Report →
        </Link>
      </div>
    </div>
  );
}
