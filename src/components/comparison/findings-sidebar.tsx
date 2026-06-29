"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Finding } from "@/domain/models";
import { FindingSeverity, FindingCategory } from "@/domain/enums";
import { cn } from "@/lib/utils";

interface FindingsSidebarProps {
  findings: Finding[];
  selectedFindingId: string | null;
  onSelectFinding: (id: string | null) => void;
  reviewerActions: Record<string, ReviewAction>;
  onAction: (findingId: string, action: ReviewAction) => void;
  onAddNote: (findingId: string) => void;
}

export type ReviewAction = "accepted" | "dismissed" | "correction" | null;

const severityStyles = {
  [FindingSeverity.Critical]: {
    dot: "bg-[#dc2626]",
    badge: "bg-[#fee2e2] text-[#991b1b]",
    label: "Critical",
  },
  [FindingSeverity.Major]: {
    dot: "bg-[#f97316]",
    badge: "bg-[#ffedd5] text-[#9a3412]",
    label: "Major",
  },
  [FindingSeverity.Minor]: {
    dot: "bg-[#64748b]",
    badge: "bg-[#f1f5f9] text-[#334155]",
    label: "Minor",
  },
};

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

type FilterMode = "all" | FindingSeverity;

export function FindingsSidebar({
  findings,
  selectedFindingId,
  onSelectFinding,
  reviewerActions,
}: FindingsSidebarProps) {
  const [filter, setFilter] = useState<FilterMode>("all");

  const filteredFindings = findings.filter((f) => {
    if (filter === "all") return true;
    return f.severity === filter;
  });

  const counts = {
    critical: findings.filter((f) => f.severity === FindingSeverity.Critical).length,
    major: findings.filter((f) => f.severity === FindingSeverity.Major).length,
    minor: findings.filter((f) => f.severity === FindingSeverity.Minor).length,
  };

  return (
    <div className="flex h-full w-[210px] min-w-[210px] shrink-0 flex-col overflow-hidden border-l border-border bg-card">
      <div className="shrink-0 border-b border-border px-3 py-2.5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground">Findings</h3>
          <span className="text-[11px] text-muted-foreground">
            {findings.length} items
          </span>
        </div>

        <div className="flex flex-wrap gap-0.5">
          <FilterPill
            active={filter === "all"}
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-primary text-primary-foreground" : ""}
          >
            All ({findings.length})
          </FilterPill>
          <FilterPill
            active={filter === FindingSeverity.Critical}
            onClick={() => setFilter(FindingSeverity.Critical)}
            className={
              filter === FindingSeverity.Critical
                ? "bg-[#fee2e2] font-bold text-[#991b1b]"
                : ""
            }
          >
            {counts.critical} Critical
          </FilterPill>
          <FilterPill
            active={filter === FindingSeverity.Major}
            onClick={() => setFilter(FindingSeverity.Major)}
            className={
              filter === FindingSeverity.Major
                ? "bg-[#ffedd5] font-bold text-[#9a3412]"
                : ""
            }
          >
            {counts.major} Major
          </FilterPill>
          <FilterPill
            active={filter === FindingSeverity.Minor}
            onClick={() => setFilter(FindingSeverity.Minor)}
            className={
              filter === FindingSeverity.Minor
                ? "bg-[#f1f5f9] font-semibold text-[#334155]"
                : ""
            }
          >
            {counts.minor} Minor
          </FilterPill>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {findings.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0fdf4]">
              <CheckCircle2 className="h-5 w-5 text-[#166534]" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No significant differences found
            </p>
            <p className="text-xs text-muted-foreground">
              Automated checks did not detect differences. A human reviewer
              should still confirm before approval.
            </p>
          </div>
        ) : filteredFindings.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No findings match this filter.
            </p>
          </div>
        ) : (
          filteredFindings.map((finding) => {
            const sev = severityStyles[finding.severity];
            const isSelected = selectedFindingId === finding.id;
            const action = reviewerActions[finding.id] ?? null;

            return (
              <button
                key={finding.id}
                type="button"
                onClick={() => onSelectFinding(isSelected ? null : finding.id)}
                className={cn(
                  "flex w-full items-start gap-1.5 border-b border-[#f0eee9] px-3 py-2.5 text-left transition-colors hover:bg-secondary",
                  isSelected && "border-l-[3px] border-l-[#2d6be4] bg-[#eef4ff] pl-[calc(0.75rem-3px)]"
                )}
              >
                <span
                  className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", sev.dot)}
                />
                <div className="min-w-0 flex-1">
                  <div className="break-words text-[11.5px] font-medium leading-snug text-foreground">
                    {finding.title}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1">
                    <span
                      className={cn(
                        "rounded-[2px] px-1 py-px text-[9.5px] font-semibold",
                        sev.badge
                      )}
                    >
                      {sev.label}
                    </span>
                    <span className="text-[10px] text-[#9ca3af]">
                      {categoryLabels[finding.category]}
                    </span>
                  </div>
                  {action && (
                    <span className="mt-1 inline-block rounded-[2px] bg-[#f0fdf4] px-1 py-px text-[9px] font-semibold text-[#166534]">
                      {action === "accepted" ? "Confirmed" : "Dismissed"}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  className,
  children,
}: {
  active: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[3px] px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent",
        active && "font-bold",
        className
      )}
    >
      {children}
    </button>
  );
}
