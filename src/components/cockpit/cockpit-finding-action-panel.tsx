"use client";

import { Finding } from "@/domain/models";
import { FindingSeverity, FindingCategory } from "@/domain/enums";
import { cn } from "@/lib/utils";
import type { ReviewAction } from "@/components/comparison/findings-sidebar";

const categoryLabels: Record<FindingCategory, string> = {
  [FindingCategory.TextContent]: "Text",
  [FindingCategory.Barcode]: "Barcode",
  [FindingCategory.Symbol]: "Symbol",
  [FindingCategory.Layout]: "Layout",
  [FindingCategory.Color]: "Color",
  [FindingCategory.Typography]: "Typography",
  [FindingCategory.Metadata]: "Metadata",
  [FindingCategory.MissingElement]: "Missing",
};

const severityPill = {
  [FindingSeverity.Critical]: "cockpit-pill-crit",
  [FindingSeverity.Major]: "cockpit-pill-maj",
  [FindingSeverity.Minor]: "cockpit-pill-min",
};

interface CockpitFindingActionPanelProps {
  finding: Finding | null;
  findingLabel: string | null;
  reviewerAction: ReviewAction;
  onAction: (action: ReviewAction) => void;
  onAddNote: () => void;
}

export function CockpitFindingActionPanel({
  finding,
  findingLabel,
  reviewerAction,
  onAction,
  onAddNote,
}: CockpitFindingActionPanelProps) {
  if (!finding || !findingLabel) {
    return (
      <div className="mb-3 border border-dashed border-border bg-[#f8fafc] px-4 py-3 text-center">
        <p className="text-[13px] font-semibold text-muted-foreground">
          Select a finding to review evidence and record QA actions
        </p>
      </div>
    );
  }

  const confirmed = reviewerAction === "accepted";
  const dismissed = reviewerAction === "dismissed";

  return (
    <div className="sticky bottom-3 z-20 mb-3 border-2 border-[#174ea6] bg-white shadow-[0_12px_40px_rgba(16,24,40,0.14)]">
      <div className="border-b border-[#dbeafe] bg-[#eff6ff] px-4 py-2">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[#174ea6]">
          Selected finding — reviewer actions
        </p>
      </div>
      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[13px] font-black text-[#174ea6]">
              {findingLabel}
            </span>
            <span className={cn("cockpit-pill", severityPill[finding.severity])}>
              {finding.severity === FindingSeverity.Critical
                ? "Critical"
                : finding.severity === FindingSeverity.Major
                  ? "Major"
                  : "Minor"}
            </span>
            <span className="cockpit-pill">{categoryLabels[finding.category]}</span>
          </div>
          <p className="mt-1 truncate text-[14px] font-extrabold text-foreground">
            {finding.title}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Recommended: {finding.recommendedAction}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onAction(confirmed ? null : "accepted")}
            className={cn(
              "cockpit-btn cockpit-btn-primary min-w-[148px]",
              confirmed && "ring-2 ring-[#174ea6] ring-offset-1"
            )}
          >
            {confirmed ? "✓ Finding Confirmed" : "Confirm Finding"}
          </button>
          <button
            type="button"
            onClick={() => onAction(dismissed ? null : "dismissed")}
            className={cn(
              "cockpit-btn cockpit-btn-warn min-w-[188px]",
              dismissed && "ring-2 ring-[#b91c1c] ring-offset-1"
            )}
          >
            {dismissed ? "Dismissed with reason" : "Dismiss with required reason"}
          </button>
          <button type="button" onClick={onAddNote} className="cockpit-btn min-w-[140px]">
            Add reviewer note
          </button>
        </div>
      </div>
    </div>
  );
}
