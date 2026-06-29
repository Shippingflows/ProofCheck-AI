"use client";

import { useStats } from "@/hooks/use-inspections";

const statConfig = [
  { key: "total" as const, label: "Total Inspections", color: "text-foreground" },
  { key: "pendingReview" as const, label: "Pending Review", color: "text-[#c2410c]" },
  {
    key: "supplierCorrectionsPending" as const,
    label: "Corrections Pending",
    color: "text-[#1d4ed8]",
  },
  {
    key: "rejectedThisMonth" as const,
    label: "Rejected This Month",
    color: "text-[#b91c1c]",
  },
  {
    key: "avgReviewTimeMinutes" as const,
    label: "Avg Review (min)",
    color: "text-[#166534]",
    suffix: "",
  },
];

export function StatsCards() {
  const { data: stats, isLoading } = useStats();

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statConfig.map((stat) => (
          <div
            key={stat.key}
            className="rounded-[3px] border border-border bg-card px-[18px] py-4"
          >
            <p className={`font-mono text-[26px] font-bold leading-none ${stat.color}`}>
              {isLoading || !stats ? (
                <span className="inline-block h-7 w-8 animate-pulse rounded bg-muted align-middle" />
              ) : (
                <>
                  {stats[stat.key]}
                  {"suffix" in stat ? stat.suffix : ""}
                </>
              )}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-[3px] border border-[#fde68a] bg-[#fffbeb] px-4 py-2.5 text-[11.5px] text-[#92400e]">
        Pilot metrics — illustrative figures from sample dataset. Not live production
        data.
      </div>
    </div>
  );
}
