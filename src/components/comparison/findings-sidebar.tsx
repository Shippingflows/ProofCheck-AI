"use client";

import { useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  PenLine,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Finding } from "@/domain/models";
import { FindingSeverity, FindingCategory } from "@/domain/enums";
import { cn } from "@/lib/utils";
import {
  isPotentialMismatch,
  confidenceLabel,
  whyFlagged,
  HUMAN_CONFIRMATION_NOTE,
} from "@/lib/findings";

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
  onAction,
  onAddNote,
}: FindingsSidebarProps) {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    <div className="flex h-full w-80 flex-col border-l border-border bg-card">
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
          const isExpanded = expandedId === finding.id;
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
                onClick={() => {
                  onSelectFinding(isSelected ? null : finding.id);
                  setExpandedId(isExpanded ? null : finding.id);
                }}
                className="flex w-full items-start gap-2.5 px-4 py-3 text-left hover:bg-accent/50"
              >
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", config.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground truncate">
                      {finding.title}
                    </span>
                    {action && (
                      <ActionBadge action={action} />
                    )}
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
                {isExpanded ? (
                  <ChevronUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-3">
                  {/* Evidence location */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span>
                      <span className="font-medium text-foreground">Page</span>{" "}
                      {finding.pageNumber}
                    </span>
                    <span>
                      <span className="font-medium text-foreground">
                        Location
                      </span>{" "}
                      {finding.location}
                    </span>
                    <span>{confidenceLabel(finding)}</span>
                  </div>

                  {/* Why it was flagged */}
                  <div>
                    <p className="text-[11px] font-medium text-foreground">
                      Why this was flagged
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {whyFlagged(finding)}
                    </p>
                  </div>

                  {(finding.sourceValue || finding.supplierValue) && (
                    <div className="space-y-1.5 rounded-md border border-border bg-card p-2.5">
                      <div className="flex gap-2 text-xs">
                        <span className="w-16 shrink-0 font-medium text-emerald-700">
                          Approved
                        </span>
                        <span className="font-mono text-foreground">
                          {finding.sourceValue ?? "—"}
                        </span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="w-16 shrink-0 font-medium text-red-600">
                          Supplier
                        </span>
                        <span className="font-mono text-foreground">
                          {finding.supplierValue ?? "Not detected"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Human confirmation reminder */}
                  <p className="rounded-md bg-amber-50 px-2.5 py-1.5 text-[11px] leading-relaxed text-amber-800">
                    {HUMAN_CONFIRMATION_NOTE}
                  </p>

                  {/* Reviewer action buttons */}
                  <div className="flex gap-1.5 pt-1">
                    <Button
                      variant={action === "accepted" ? "default" : "outline"}
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction(finding.id, action === "accepted" ? null : "accepted");
                      }}
                      className={cn(
                        action === "accepted" && "bg-amber-600 hover:bg-amber-700"
                      )}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Accept Risk
                    </Button>
                    <Button
                      variant={action === "dismissed" ? "default" : "outline"}
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction(finding.id, action === "dismissed" ? null : "dismissed");
                      }}
                      className={cn(
                        action === "dismissed" && "bg-slate-600 hover:bg-slate-700"
                      )}
                    >
                      <XCircle className="h-3 w-3" />
                      Dismiss
                    </Button>
                    <Button
                      variant={action === "correction" ? "default" : "outline"}
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction(
                          finding.id,
                          action === "correction" ? null : "correction"
                        );
                      }}
                      className={cn(
                        action === "correction" && "bg-red-600 hover:bg-red-700"
                      )}
                    >
                      <PenLine className="h-3 w-3" />
                      Correction
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddNote(finding.id);
                      }}
                      title="Add note"
                    >
                      <MessageSquare className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
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
