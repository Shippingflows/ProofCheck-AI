"use client";

import { Inspection } from "@/domain/models";
import { formatSeverityCounts } from "@/lib/format-severity";
import { getProfileSummary } from "@/lib/inspection-profile";
import { Badge } from "@/components/ui/badge";

interface InspectionSummaryBarProps {
  inspection: Inspection;
}

export function InspectionSummaryBar({ inspection }: InspectionSummaryBarProps) {
  const profile = getProfileSummary(inspection.profileRef);

  return (
    <div className="shrink-0 border-b border-border bg-card px-4 py-2.5">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
        <SummaryItem label="Status">
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-[10px] font-semibold text-amber-800"
          >
            Action Required
          </Badge>
        </SummaryItem>
        <SummaryItem label="Findings">
          <span className="font-medium text-foreground">
            {formatSeverityCounts(inspection.findingsCount)}
          </span>
        </SummaryItem>
        <SummaryItem label="Profile">
          <span className="font-medium text-foreground">
            {profile ? `${profile.name} · ${profile.sensitivity}` : "—"}
          </span>
        </SummaryItem>
        <SummaryItem label="Master">
          <span className="font-medium text-foreground">
            {inspection.sku} {inspection.revision} approved master
          </span>
        </SummaryItem>
        <SummaryItem label="Supplier">
          <span className="font-medium text-foreground">
            {inspection.supplierName} proof REV-03
          </span>
        </SummaryItem>
        <SummaryItem label="Review mode">
          <span className="font-medium text-amber-800">
            Human QA confirmation required
          </span>
        </SummaryItem>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{label}:</span>
      {children}
    </div>
  );
}
