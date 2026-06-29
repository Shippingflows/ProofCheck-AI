"use client";

import { useState } from "react";
import Link from "next/link";
import { Finding } from "@/domain/models";
import { FindingSeverity, FindingCategory } from "@/domain/enums";
import { cn } from "@/lib/utils";
import { confidencePercent } from "@/lib/findings";
import { getDifferenceNote } from "@/lib/finding-difference";
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

const severityLabel = {
  [FindingSeverity.Critical]: "Critical",
  [FindingSeverity.Major]: "Major",
  [FindingSeverity.Minor]: "Minor",
};

type FilterMode = "all" | FindingSeverity;

interface CockpitFindingsRegisterProps {
  findings: Finding[];
  selectedFindingId: string | null;
  findingNumberMap: Map<string, number>;
  reviewerAction: ReviewAction;
  onSelectFinding: (id: string) => void;
  onAction: (action: ReviewAction) => void;
  onAddNote: () => void;
}

export function CockpitFindingsRegister({
  findings,
  selectedFindingId,
  findingNumberMap,
  reviewerAction,
  onSelectFinding,
  onAction,
  onAddNote,
}: CockpitFindingsRegisterProps) {
  const [filter, setFilter] = useState<FilterMode>("all");
  const selected = findings.find((f) => f.id === selectedFindingId) ?? null;

  const counts = {
    critical: findings.filter((f) => f.severity === FindingSeverity.Critical).length,
    major: findings.filter((f) => f.severity === FindingSeverity.Major).length,
    minor: findings.filter((f) => f.severity === FindingSeverity.Minor).length,
  };

  const filtered =
    filter === "all" ? findings : findings.filter((f) => f.severity === filter);

  const confirmed = reviewerAction === "accepted";
  const dismissed = reviewerAction === "dismissed";
  const selectedNum = selectedFindingId
    ? findingNumberMap.get(selectedFindingId) ?? 0
    : 0;
  const fid = selectedNum ? `F-${String(selectedNum).padStart(3, "0")}` : "";

  return (
    <aside className="cockpit-panel max-h-[calc(100vh-190px)] overflow-auto">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-[11px]">
        <div className="font-extrabold text-foreground">Findings Register</div>
        <span className="cockpit-pill">{findings.length} items</span>
      </div>

      <div className="p-3">
        <div className="mb-2.5 flex flex-wrap gap-1">
          <FilterTab active={filter === "all"} onClick={() => setFilter("all")}>
            All {findings.length}
          </FilterTab>
          <FilterTab
            active={filter === FindingSeverity.Critical}
            onClick={() => setFilter(FindingSeverity.Critical)}
          >
            {counts.critical} Critical
          </FilterTab>
          <FilterTab
            active={filter === FindingSeverity.Major}
            onClick={() => setFilter(FindingSeverity.Major)}
          >
            {counts.major} Major
          </FilterTab>
          <FilterTab
            active={filter === FindingSeverity.Minor}
            onClick={() => setFilter(FindingSeverity.Minor)}
          >
            {counts.minor} Minor
          </FilterTab>
        </div>

        {filtered.map((finding) => {
          const num = findingNumberMap.get(finding.id) ?? 0;
          const isActive = finding.id === selectedFindingId;
          return (
            <button
              key={finding.id}
              type="button"
              onClick={() => onSelectFinding(finding.id)}
              className={cn(
                "mb-1.5 grid w-full grid-cols-[30px_1fr_auto] items-start gap-2 border border-border bg-card p-2 text-left",
                isActive &&
                  "border-[#93c5fd] bg-[#eff6ff] shadow-[inset_3px_0_0_#174ea6]"
              )}
            >
              <div className="font-mono text-[13px] font-black text-[#475467]">
                F-{String(num).padStart(3, "0")}
              </div>
              <div>
                <div className="font-extrabold text-foreground">{finding.title}</div>
                <div className="mt-0.5 font-mono text-[10px] text-[#667085]">
                  {severityLabel[finding.severity]} · {categoryLabels[finding.category]} ·
                  Pg {finding.pageNumber}
                  {isActive ? " · selected" : ""}
                </div>
              </div>
              <span className={cn("cockpit-pill", severityPill[finding.severity])}>
                {severityLabel[finding.severity]}
              </span>
            </button>
          );
        })}

        {selected && (
          <>
            <div className="cockpit-section-label">Finding evidence</div>
            <div className="border border-[#bcd2f6] bg-[#f8fbff] p-2.5">
              <div className="mb-2 font-extrabold text-foreground">
                {fid} {selected.title}
              </div>

              <div className="my-2.5 grid grid-cols-2 gap-2">
                <div className="border border-border bg-card p-2">
                  <div className="cockpit-label">Approved master</div>
                  <div className="font-mono text-[22px] font-black text-[#047857]">
                    {selected.sourceValue ? "Present" : "—"}
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-[#047857]">
                    {selected.sourceValue ?? "—"}
                  </div>
                </div>
                <div className="border border-[#f3b4b4] bg-[#fff5f5] p-2">
                  <div className="cockpit-label">Supplier proof</div>
                  <div className="font-mono text-[22px] font-black text-[#b91c1c]">
                    {selected.supplierValue ? "Different" : "Absent"}
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-[#b91c1c]">
                    {selected.supplierValue ?? "Not detected"}
                  </div>
                </div>
              </div>

              <div className="cockpit-label">Difference</div>
              <div className="text-[13px] leading-relaxed">{getDifferenceNote(selected)}</div>

              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <div className="border border-border bg-card p-2">
                  <div className="cockpit-label">Detection method</div>
                  <b className="text-[13px]">{selected.detectionMethod}</b>
                </div>
                <div className="border border-border bg-card p-2">
                  <div className="cockpit-label">Confidence</div>
                  <b className="text-[13px]">{confidencePercent(selected)}%</b>
                  <div className="mt-1.5 h-1.5 bg-[#e5e7eb]">
                    <span
                      className="block h-full bg-[#174ea6]"
                      style={{ width: `${confidencePercent(selected)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="cockpit-section-label">Severity rationale</div>
              <div className="cockpit-tiny text-[#667085]">
                {selected.severity === FindingSeverity.Major
                  ? "Major because required packaging symbol is missing. Escalates to Critical if tied to release-market regulatory claim."
                  : selected.severity === FindingSeverity.Critical
                    ? "Critical because this difference may affect regulatory compliance, traceability, or patient safety."
                    : "Minor finding — reviewer confirmation recommended before disposition."}
              </div>

              <div className="mt-2.5 grid gap-1.5">
                <button
                  type="button"
                  onClick={() => onAction(confirmed ? null : "accepted")}
                  className={cn(
                    "cockpit-btn",
                    confirmed ? "cockpit-btn-primary" : "cockpit-btn-primary"
                  )}
                >
                  {confirmed ? "✓ Finding Confirmed" : "Confirm Finding"}
                </button>
                <button
                  type="button"
                  onClick={() => onAction(dismissed ? null : "dismissed")}
                  className="cockpit-btn cockpit-btn-warn"
                >
                  {dismissed ? "Dismissed with reason" : "Dismiss with required reason"}
                </button>
                <button type="button" onClick={onAddNote} className="cockpit-btn">
                  Add reviewer note
                </button>
              </div>
            </div>

            <div className="cockpit-section-label">Supplier correction preview</div>
            <div className="border border-border bg-[#fbfcfe] p-2.5 text-xs leading-relaxed">
              <b>Correction draft item {fid}</b>
              <br />
              Please correct <em>{selected.title.toLowerCase()}</em> and resubmit the
              supplier proof. Include finding ID {fid} in your response.
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("cockpit-tab", active && "cockpit-tab-on")}
    >
      {children}
    </button>
  );
}
