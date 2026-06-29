"use client";

import { useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Finding } from "@/domain/models";
import { FindingSeverity, FindingCategory } from "@/domain/enums";
import { cn } from "@/lib/utils";
import { isPotentialMismatch } from "@/lib/findings";

interface FindingsSidebarProps {
  findings: Finding[];
  selectedFindingId: string | null;
  onSelectFinding: (id: string | null) => void;
  reviewerActions: Record<string, ReviewAction>;
  onAction: (findingId: string, action: ReviewAction) => void;
  onAddNote: (findingId: string) => void;
}

export type ReviewAction = "accepted" | "dismissed" | "correction" | null;

const severityConfig = {
  [FindingSeverity.Critical]: {
    icon: AlertCircle,
    label: "Critical",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
  },
  [FindingSeverity.Major]: {
    icon: AlertTriangle,
    label: "Major",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
  },
  [FindingSeverity.Minor]: {
    icon: Info,
    label: "Minor",
    color: "text-slate-500",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
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

type FilterMode = "all" | FindingSeverity | FindingCategory;

export function FindingsSidebar({
  findings,
  selectedFindingId,
  onSelectFinding,
  reviewerActions,
}: FindingsSidebarProps) {
  const [filter, setFilter] = useState<FilterMode>("all");

  const filteredFindings = findings.filter((f) => {
    if (filter === "all") return true;
    if (Object.values(FindingSeverity).includes(filter as FindingSeverity)) {
      return f.severity === filter;
    }
    return f.category === filter;
  });

  const counts = {
    critical: findings.filter((f) => f.severity === FindingSeverity.Critical).length,
    major: findings.filter((f) => f.severity === FindingSeverity.Major).length,
    minor: findings.filter((f) => f.severity === FindingSeverity.Minor).length,
  };

  return (
    <div className="flex h-full w-60 min-w-[240px] shrink-0 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Findings</h3>
          <span className="text-xs text-muted-foreground">
            {findings.length} items
          </span>
        </div>

        {/* Severity counts */}
        <div className="mt-2 flex gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "rounded px-2 py-0.5 text-xs font-medium transition-colors",
              filter === "all"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            All ({findings.length})
          </button>
          <button
            onClick={() => setFilter(FindingSeverity.Critical)}
            className={cn(
              "rounded px-2 py-0.5 text-xs font-medium transition-colors",
              filter === FindingSeverity.Critical
                ? "bg-red-100 text-red-700"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {counts.critical} Critical
          </button>
          <button
            onClick={() => setFilter(FindingSeverity.Major)}
            className={cn(
              "rounded px-2 py-0.5 text-xs font-medium transition-colors",
              filter === FindingSeverity.Major
                ? "bg-amber-100 text-amber-700"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {counts.major} Major
          </button>
          <button
            onClick={() => setFilter(FindingSeverity.Minor)}
            className={cn(
              "rounded px-2 py-0.5 text-xs font-medium transition-colors",
              filter === FindingSeverity.Minor
                ? "bg-slate-200 text-slate-700"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {counts.minor} Minor
          </button>
        </div>

        {/* Category filter */}
        <div className="mt-2 flex flex-wrap gap-1">
          {Object.entries(categoryLabels).map(([cat, label]) => {
            const count = findings.filter((f) => f.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() =>
                  setFilter(filter === cat ? "all" : (cat as FilterMode))
                }
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                  filter === cat
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Findings list */}
      <div className="flex-1 overflow-y-auto">
        {findings.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No significant differences found
            </p>
            <p className="text-xs text-muted-foreground">
              Automated checks did not detect differences. A human reviewer
              should still confirm before approval.
            </p>
          </div>
        ) : (
          filteredFindings.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No findings match this filter.
              </p>
            </div>
          )
        )}
        {filteredFindings.map((finding) => {
          const config = severityConfig[finding.severity];
          const Icon = config.icon;
          const isSelected = selectedFindingId === finding.id;
          const action = reviewerActions[finding.id] ?? null;

          return (
            <div
              key={finding.id}
              className={cn(
                "border-b border-border transition-colors",
                isSelected && "bg-primary/5"
              )}
            >
              <button
                onClick={() =>
                  onSelectFinding(isSelected ? null : finding.id)
                }
                className="flex w-full items-start gap-2.5 px-4 py-3 text-left hover:bg-accent/50"
              >
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", config.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground truncate">
                      {finding.title}
                    </span>
                    {action && <ActionBadge action={action} />}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{categoryLabels[finding.category]}</span>
                    <span>·</span>
                    <span>Page {finding.pageNumber}</span>
                  </div>
                  {isPotentialMismatch(finding) && (
                    <span className="mt-1 inline-flex items-center rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                      Potential mismatch
                    </span>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionBadge({ action }: { action: ReviewAction }) {
  if (!action) return null;

  const config = {
    accepted: { label: "Accepted", className: "bg-amber-100 text-amber-700" },
    dismissed: { label: "Dismissed", className: "bg-slate-100 text-slate-600" },
    correction: { label: "Correction", className: "bg-red-100 text-red-700" },
  };

  const c = config[action];
  return (
    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", c.className)}>
      {c.label}
    </span>
  );
}
