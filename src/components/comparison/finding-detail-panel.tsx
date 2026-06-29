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
import { confidenceLabel, whyFlagged } from "@/lib/findings";
import type { ReviewAction } from "@/components/comparison/findings-sidebar";

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
      <div className="flex h-full w-72 flex-col items-center justify-center border-l border-border bg-muted/20 px-4 text-center">
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

  return (
    <div className="flex h-full w-72 flex-col border-l border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-start gap-2">
          <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", config.color)} />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground leading-tight">
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

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <DetailRow label="Location" value={finding.location} />
        <DetailRow label="Page" value={String(finding.pageNumber)} />
        <DetailRow label="Detection" value={finding.detectionMethod} />
        <DetailRow label="Status" value={confidenceLabel(finding)} />
        <DetailRow label="Recommended action" value={finding.recommendedAction} />

        <div>
          <p className="text-[11px] font-medium text-muted-foreground">Why flagged</p>
          <p className="mt-0.5 text-xs leading-relaxed text-foreground">
            {whyFlagged(finding)}
          </p>
        </div>

        {(finding.sourceValue || finding.supplierValue) && (
          <Card className="border border-border shadow-none">
            <CardContent className="space-y-2 p-3">
              <ValueRow label="Approved" value={finding.sourceValue ?? "—"} tone="master" />
              <ValueRow
                label="Supplier"
                value={finding.supplierValue ?? "Not detected"}
                tone="supplier"
              />
            </CardContent>
          </Card>
        )}

        {isBarcode && (
          <Card className="border border-amber-200 bg-amber-50/50 shadow-none">
            <CardHeader className="pb-1 pt-3 px-3">
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
              <p className="text-[11px] text-muted-foreground italic">
                Not validated against ISO/IEC 15416 — human verification required.
              </p>
            </CardContent>
          </Card>
        )}

        {(finding.masterEvidenceSrc || finding.supplierEvidenceSrc) && (
          <div className="space-y-2">
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

      <div className="space-y-2 border-t border-border p-3">
        <Button
          variant={reviewerAction === "accepted" ? "default" : "outline"}
          size="sm"
          className="w-full justify-start"
          onClick={() =>
            onAction(reviewerAction === "accepted" ? null : "accepted")
          }
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Confirm Finding
        </Button>
        <Button
          variant={reviewerAction === "dismissed" ? "default" : "outline"}
          size="sm"
          className="w-full justify-start"
          onClick={() =>
            onAction(reviewerAction === "dismissed" ? null : "dismissed")
          }
        >
          <XCircle className="h-3.5 w-3.5" />
          Dismiss False Positive
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onAddNote}>
          <MessageSquare className="h-3.5 w-3.5" />
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
      <p className="text-xs text-foreground">{value}</p>
    </div>
  );
}

function ValueRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "master" | "supplier";
}) {
  return (
    <div className="flex gap-2 text-xs">
      <span
        className={cn(
          "w-16 shrink-0 font-medium",
          tone === "master" ? "text-emerald-700" : "text-red-600"
        )}
      >
        {label}
      </span>
      <span className="font-mono text-foreground">{value}</span>
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
