"use client";

import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  Barcode,
  X,
} from "lucide-react";
import Image from "next/image";
import { Finding } from "@/domain/models";
import { FindingSeverity, FindingCategory } from "@/domain/enums";
import { cn } from "@/lib/utils";
import { confidencePercent } from "@/lib/findings";
import { getDifferenceNote } from "@/lib/finding-difference";
import type { ReviewAction } from "@/components/comparison/findings-sidebar";

const PANEL_WIDTH = "min(100%, 480px)";
const PANEL_BASIS = "480px";

const severityStyles = {
  [FindingSeverity.Critical]: {
    dot: "bg-[#dc2626]",
    badge: "border-[#fecaca] bg-[#fee2e2] text-[#991b1b]",
    label: "Critical",
  },
  [FindingSeverity.Major]: {
    dot: "bg-[#f97316]",
    badge: "border-[#fed7aa] bg-[#ffedd5] text-[#9a3412]",
    label: "Major",
  },
  [FindingSeverity.Minor]: {
    dot: "bg-[#64748b]",
    badge: "border-[#cbd5e1] bg-[#f1f5f9] text-[#334155]",
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

const panelShell =
  "flex h-full min-h-0 shrink-0 flex-col border-l border-border bg-card";

interface FindingDetailPanelProps {
  finding: Finding | null;
  reviewerAction: ReviewAction;
  onAction: (action: ReviewAction) => void;
  onAddNote: () => void;
  onClose?: () => void;
}

export function FindingDetailPanel({
  finding,
  reviewerAction,
  onAction,
  onAddNote,
  onClose,
}: FindingDetailPanelProps) {
  if (!finding) {
    return (
      <div
        className={cn(panelShell, "relative items-center justify-center px-5 text-center")}
        style={{ width: PANEL_WIDTH, minWidth: "360px", flexBasis: PANEL_BASIS }}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <p className="text-sm font-medium text-muted-foreground">Select a finding</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Evidence and reviewer actions appear here.
        </p>
      </div>
    );
  }

  const sev = severityStyles[finding.severity];
  const isBarcode = finding.category === FindingCategory.Barcode;
  const confidence = confidencePercent(finding);
  const confirmed = reviewerAction === "accepted";
  const dismissed = reviewerAction === "dismissed";

  return (
    <div
      className={panelShell}
      style={{ width: PANEL_WIDTH, minWidth: "360px", flexBasis: PANEL_BASIS }}
    >
      <div className="shrink-0 border-b border-border px-5 py-3.5">
        <div
          className="border-l-4 pl-3"
          style={{
            borderLeftColor:
              finding.severity === FindingSeverity.Critical
                ? "#dc2626"
                : finding.severity === FindingSeverity.Major
                  ? "#f97316"
                  : "#64748b",
          }}
        >
          <div className="flex items-start gap-2.5">
            <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", sev.dot)} />
            <div className="min-w-0 flex-1">
              <h3 className="mb-2 text-sm font-semibold leading-snug text-foreground">
                {finding.title}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <span
                  className={cn(
                    "rounded-[3px] border px-2 py-0.5 text-[11px] font-bold",
                    sev.badge
                  )}
                >
                  {sev.label}
                </span>
                <span className="rounded-[3px] border border-[#cbd5e1] bg-[#f8fafc] px-2 py-0.5 text-[11px] font-medium text-[#475569]">
                  {categoryLabels[finding.category]}
                </span>
                <span className="rounded-[3px] border border-border bg-[#f8fafc] px-2 py-0.5 text-[11px] text-muted-foreground">
                  Pg {finding.pageNumber}
                </span>
              </div>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close detail panel"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
          Evidence
        </p>
        <div className="mb-4 overflow-hidden rounded border border-border">
          <div className="border-b border-[#bbf7d0] bg-[#f0fdf4] px-3.5 py-2.5">
            <p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.07em] text-[#065f46]">
              Approved Master
            </p>
            <p className="break-all font-mono text-[15px] font-medium leading-snug text-[#14532d]">
              {finding.sourceValue ?? "—"}
            </p>
          </div>
          <div className="border-b border-[#fecaca] bg-[#fff5f5] px-3.5 py-2.5">
            <p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.07em] text-[#991b1b]">
              Supplier Proof
            </p>
            <p className="break-all font-mono text-[15px] font-medium leading-snug text-[#7f1d1d]">
              {finding.supplierValue ?? "Not detected"}
            </p>
          </div>
          <div className="bg-[#fafaf9] px-3.5 py-2.5">
            <p className="mb-1 text-[9.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
              Difference
            </p>
            <p className="text-xs leading-relaxed text-foreground">
              {getDifferenceNote(finding)}
            </p>
          </div>
        </div>

        <div className="mb-3.5 grid grid-cols-2 gap-2.5">
          <InfoBox label="Detection Method" value={finding.detectionMethod} />
          <div className="rounded-[3px] border border-border bg-[#f8fafc] px-3 py-2.5">
            <p className="mb-1 text-[9.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
              Confidence
            </p>
            <p className="font-mono text-[22px] font-bold leading-none text-foreground">
              {confidence}%
            </p>
            <div className="mt-1.5 h-[3px] rounded-sm bg-border">
              <div
                className="h-full rounded-sm bg-primary"
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2.5">
          <InfoBox label="Location" value={finding.location} />
          <InfoBox label="Page" value={String(finding.pageNumber)} />
        </div>

        {isBarcode && (
          <div className="mb-3.5 rounded-[3px] border border-amber-200 bg-amber-50/50 px-3.5 py-2.5 text-xs">
            <p className="mb-1 flex items-center gap-1.5 font-semibold">
              <Barcode className="h-3.5 w-3.5" />
              Barcode check
            </p>
            <p>
              Decoded:{" "}
              <span className="font-mono font-medium">
                {finding.supplierValue ?? finding.sourceValue ?? "—"}
              </span>
            </p>
            <p className="mt-1 text-[11px] italic text-muted-foreground">
              Not validated against ISO/IEC 15416 — human verification required.
            </p>
          </div>
        )}

        <div className="mb-3.5 rounded-[3px] border border-[#fde68a] bg-[#fffbeb] px-3.5 py-2.5">
          <p className="mb-1 text-[9.5px] font-bold uppercase tracking-[0.06em] text-[#92400e]">
            Suggested QA Action
          </p>
          <p className="text-[13px] font-medium text-[#78350f]">
            {finding.recommendedAction}
          </p>
        </div>

        <div className="rounded-[3px] border border-border bg-[#f8fafc] px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
          ProofCheck AI assists detection and does not make approval or rejection
          decisions. All dispositions require confirmation by an authorized QA
          reviewer.
        </div>

        {(finding.masterEvidenceSrc || finding.supplierEvidenceSrc) && (
          <div className="mt-3.5 space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground">
              Evidence snapshots
            </p>
            {finding.masterEvidenceSrc && (
              <EvidenceCrop label="Approved master" src={finding.masterEvidenceSrc} />
            )}
            {finding.supplierEvidenceSrc && (
              <EvidenceCrop label="Supplier proof" src={finding.supplierEvidenceSrc} />
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-[#fafaf9] px-5 py-3.5">
        <button
          type="button"
          onClick={() => onAction(confirmed ? null : "accepted")}
          className={cn(
            "flex h-10 w-full items-center justify-center gap-2 rounded border-[1.5px] text-[13px] font-medium transition-opacity hover:opacity-90",
            confirmed
              ? "border-primary bg-primary text-primary-foreground"
              : "border-primary bg-card text-foreground"
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
          {confirmed ? "✓ Finding Confirmed" : "Confirm Finding"}
        </button>
        <button
          type="button"
          onClick={() => onAction(dismissed ? null : "dismissed")}
          className={cn(
            "flex h-10 w-full items-center justify-center gap-2 rounded border-[1.5px] text-[13px] font-medium transition-opacity hover:opacity-90",
            dismissed
              ? "border-[#374151] bg-[#374151] text-white"
              : "border-[#d1d5db] bg-card text-foreground"
          )}
        >
          <XCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
          {dismissed ? "Dismissed as False Positive" : "Dismiss as False Positive"}
        </button>
        <button
          type="button"
          onClick={onAddNote}
          className="flex h-[34px] w-full items-center justify-center gap-1.5 rounded border border-border bg-transparent text-xs font-medium text-muted-foreground hover:bg-accent"
        >
          <MessageSquare className="h-3 w-3" />
          Add Reviewer Note
        </button>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[3px] border border-border bg-[#f8fafc] px-3 py-2.5">
      <p className="mb-1 text-[9.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
        {label}
      </p>
      <p className="text-xs leading-snug text-foreground">{value}</p>
    </div>
  );
}

function EvidenceCrop({ label, src }: { label: string; src: string }) {
  return (
    <div className="rounded border border-border bg-muted/30 p-2">
      <p className="mb-1 text-[10px] font-medium text-muted-foreground">{label}</p>
      <Image
        src={src}
        alt={label}
        width={220}
        height={56}
        className="h-auto w-full rounded border border-border"
        unoptimized
      />
    </div>
  );
}
