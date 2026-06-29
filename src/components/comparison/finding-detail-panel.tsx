"use client";

import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Barcode,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Finding } from "@/domain/models";
import { FindingSeverity, FindingCategory } from "@/domain/enums";
import { cn } from "@/lib/utils";
import { confidencePercent } from "@/lib/findings";
import { getDifferenceNote } from "@/lib/finding-difference";
import type { ReviewAction } from "@/components/comparison/findings-sidebar";

const PANEL_WIDTH = "min(100%, 480px)";
const PANEL_BASIS = "480px";

const severityConfig = {
  [FindingSeverity.Critical]: {
    icon: AlertCircle,
    label: "Critical",
    color: "text-red-600",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
  },
  [FindingSeverity.Major]: {
    icon: AlertTriangle,
    label: "Major",
    color: "text-amber-600",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
  },
  [FindingSeverity.Minor]: {
    icon: Info,
    label: "Minor",
    color: "text-slate-500",
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

const panelShell =
  "flex h-full min-h-0 shrink-0 flex-col border-l border-border bg-card shadow-[-4px_0_12px_rgba(0,0,0,0.04)]";

interface FindingDetailPanelProps {
  finding: Finding | null;
  reviewerAction: ReviewAction;
  onAction: (action: ReviewAction) => void;
  onAddNote: () => void;
}

export function FindingDetailPanel({
  finding,
  reviewerAction,
  onAction,
  onAddNote,
}: FindingDetailPanelProps) {
  if (!finding) {
    return (
      <div
        className={cn(panelShell, "items-center justify-center bg-muted/20 px-4 text-center")}
        style={{ width: PANEL_WIDTH, minWidth: "360px", flexBasis: PANEL_BASIS }}
      >
        <p className="text-sm font-medium text-muted-foreground">
          Select a finding
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Evidence and reviewer actions appear here.
        </p>
      </div>
    );
  }

  const config = severityConfig[finding.severity];
  const Icon = config.icon;
  const isBarcode = finding.category === FindingCategory.Barcode;
  const confidence = `${confidencePercent(finding)}%`;

  return (
    <div
      className={panelShell}
      style={{ width: PANEL_WIDTH, minWidth: "360px", flexBasis: PANEL_BASIS }}
    >
      <div className="shrink-0 border-b border-border px-3 py-2.5">
        <div className="flex items-start gap-2">
          <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", config.color)} />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold leading-tight text-foreground">
              {finding.title}
            </h3>
            <div className="mt-1 flex flex-wrap gap-1">
              <Badge variant="outline" className={cn("text-[10px]", config.badgeClass)}>
                {config.label}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {categoryLabels[finding.category]}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <Card className="border border-border bg-muted/20 shadow-none">
          <CardHeader className="pb-1 pt-2.5 px-2.5">
            <CardTitle className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Extracted evidence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-2.5 pb-2.5">
            <EvidenceRow
              label="Approved master value"
              value={finding.sourceValue ?? "—"}
              tone="master"
            />
            <EvidenceRow
              label="Supplier proof value"
              value={finding.supplierValue ?? "Not detected"}
              tone="supplier"
            />
            <EvidenceRow
              label="Difference"
              value={getDifferenceNote(finding)}
              tone="neutral"
            />
            <EvidenceRow
              label="Detection method"
              value={finding.detectionMethod}
              tone="neutral"
            />
          </CardContent>
        </Card>

        <div className="mt-2.5 space-y-2">
          <DetailRow label="Location" value={finding.location} />
          <DetailRow label="Page" value={String(finding.pageNumber)} />
        </div>

        {isBarcode && (
          <Card className="mt-2.5 border border-amber-200 bg-amber-50/50 shadow-none">
            <CardHeader className="px-3 pb-1 pt-3">
              <CardTitle className="flex items-center gap-1.5 text-xs font-semibold">
                <Barcode className="h-3.5 w-3.5" />
                Barcode check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 px-3 pb-3 text-xs">
              <p>
                Decoded:{" "}
                <span className="font-mono font-medium">
                  {finding.supplierValue ?? finding.sourceValue ?? "—"}
                </span>
              </p>
              <p className="text-[11px] italic text-muted-foreground">
                Not validated against ISO/IEC 15416 — human verification required.
              </p>
            </CardContent>
          </Card>
        )}

        {(finding.masterEvidenceSrc || finding.supplierEvidenceSrc) && (
          <div className="mt-2.5 space-y-2">
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

      <div className="shrink-0 space-y-2 border-t border-border bg-card p-3">
        <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-muted/30 p-2.5">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground">Confidence</p>
            <p className="text-sm font-semibold text-foreground">{confidence}</p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-muted-foreground">
              Recommended action
            </p>
            <p className="break-words text-xs font-medium leading-snug text-foreground">
              {finding.recommendedAction}
            </p>
          </div>
        </div>

        <Button
          variant={reviewerAction === "accepted" ? "default" : "outline"}
          size="sm"
          className="h-auto min-h-9 w-full justify-start whitespace-normal px-3 py-2 text-left text-sm"
          onClick={() =>
            onAction(reviewerAction === "accepted" ? null : "accepted")
          }
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Confirm Finding
        </Button>
        <Button
          variant={reviewerAction === "dismissed" ? "default" : "outline"}
          size="sm"
          className="h-auto min-h-9 w-full justify-start whitespace-normal px-3 py-2 text-left text-sm"
          onClick={() =>
            onAction(reviewerAction === "dismissed" ? null : "dismissed")
          }
        >
          <XCircle className="h-4 w-4 shrink-0" />
          Dismiss False Positive
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto min-h-9 w-full justify-start whitespace-normal px-3 py-2 text-left text-sm"
          onClick={onAddNote}
        >
          <MessageSquare className="h-4 w-4 shrink-0" />
          Add Note
        </Button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="break-words text-xs text-foreground">{value}</p>
    </div>
  );
}

function EvidenceRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "master" | "supplier" | "neutral";
}) {
  return (
    <div className="text-xs">
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-0.5 break-words font-medium leading-snug",
          tone === "master" && "font-mono text-emerald-700",
          tone === "supplier" && "font-mono text-red-600",
          tone === "neutral" && "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function EvidenceCrop({ label, src }: { label: string; src: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-2">
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
