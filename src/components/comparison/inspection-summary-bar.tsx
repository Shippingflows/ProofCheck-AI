"use client";

import { Inspection } from "@/domain/models";
import { InspectionStatus } from "@/domain/enums";
import { cn } from "@/lib/utils";

interface InspectionSummaryBarProps {
  inspection: Inspection;
}

function statusBadge(status: InspectionStatus) {
  switch (status) {
    case InspectionStatus.PendingReview:
      return {
        label: "PENDING REVIEW",
        className: "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]",
      };
    case InspectionStatus.Approved:
    case InspectionStatus.ApprovedWithNotes:
      return {
        label: "APPROVED",
        className: "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]",
      };
    case InspectionStatus.Rejected:
      return {
        label: "REJECTED",
        className: "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]",
      };
    default:
      return {
        label: "IN PROGRESS",
        className: "border-border bg-muted text-muted-foreground",
      };
  }
}

export function InspectionSummaryBar({ inspection }: InspectionSummaryBarProps) {
  const badge = statusBadge(inspection.status);

  return (
    <div className="flex h-[34px] shrink-0 items-center gap-3.5 overflow-hidden border-b border-border bg-secondary px-4">
      <span className="max-w-[320px] truncate text-xs font-semibold text-foreground">
        {inspection.title}
      </span>
      <span className="shrink-0 text-[#d0ccc7]">|</span>
      <span className="shrink-0 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
        {inspection.sku} · {inspection.revision}
      </span>
      <span className="shrink-0 text-[#d0ccc7]">|</span>
      <span className="shrink-0 whitespace-nowrap text-[11px] text-muted-foreground">
        {inspection.supplierName}
      </span>
      <span className="shrink-0 text-[#d0ccc7]">|</span>
      <span className="shrink-0 whitespace-nowrap text-[11px] text-muted-foreground">
        Reviewer: {inspection.reviewerName}
      </span>
      <span
        className={cn(
          "ml-auto shrink-0 rounded-[3px] border px-2 py-0.5 text-[10px] font-semibold",
          badge.className
        )}
      >
        {badge.label}
      </span>
    </div>
  );
}
