"use client";

import { ShieldX } from "lucide-react";
import { Finding } from "@/domain/models";
import { FindingSeverity } from "@/domain/enums";

interface CockpitReleaseBlockedBannerProps {
  findings: Finding[];
}

export function CockpitReleaseBlockedBanner({ findings }: CockpitReleaseBlockedBannerProps) {
  const criticalCount = findings.filter(
    (f) => f.severity === FindingSeverity.Critical
  ).length;

  if (criticalCount === 0) return null;

  return (
    <div
      role="alert"
      className="mb-3 flex items-start gap-3 border-2 border-[#b91c1c] bg-[#fef2f2] px-4 py-3 shadow-[0_4px_14px_rgba(185,28,28,0.12)]"
    >
      <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[3px] border border-[#fecaca] bg-[#fee2e2]">
        <ShieldX className="h-5 w-5 text-[#b91c1c]" strokeWidth={2.25} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[11px] font-black uppercase tracking-[0.1em] text-[#b91c1c]">
          Release blocked
        </p>
        <p className="mt-1 text-[14px] font-extrabold leading-snug text-[#7f1d1d]">
          {criticalCount} critical finding{criticalCount === 1 ? "" : "s"} must be
          confirmed or corrected before this supplier proof can be released.
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-[#991b1b]">
          Human QA disposition is required. ProofCheck does not approve regulated
          materials automatically. Dismissals require documented rationale.
        </p>
      </div>
      <span className="cockpit-pill cockpit-pill-crit hidden shrink-0 sm:inline-flex">
        {criticalCount} Critical
      </span>
    </div>
  );
}
