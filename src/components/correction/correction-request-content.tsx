"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Copy,
  Send,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Finding, Inspection } from "@/domain/models";
import { FindingSeverity, AuditAction } from "@/domain/enums";
import { cn } from "@/lib/utils";
import { useInspection, useFindings } from "@/hooks/use-inspections";
import { addAuditEvent } from "@/data/mock-repository";
import { ErrorState, EmptyState } from "@/components/shared/state-views";

interface CorrectionRequestContentProps {
  inspection: Inspection;
  findings: Finding[];
  onMarkSent: () => void;
}

const severityConfig = {
  [FindingSeverity.Critical]: {
    icon: AlertCircle,
    label: "Critical",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
  },
  [FindingSeverity.Major]: {
    icon: AlertTriangle,
    label: "Major",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
  },
  [FindingSeverity.Minor]: {
    icon: Info,
    label: "Minor",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

function generateEmailDraft(
  inspection: Inspection,
  selectedFindings: Finding[]
): string {
  const lines: string[] = [];

  lines.push(`Subject: Correction Required — ${inspection.title}`);
  lines.push("");
  lines.push("Dear Supplier,");
  lines.push("");
  lines.push(
    `Following our proof review of "${inspection.title}" (SKU: ${inspection.sku}, Revision: ${inspection.revision}), we have identified the following items requiring correction before production approval can be granted.`
  );
  lines.push("");
  lines.push(`Total findings: ${selectedFindings.length}`);
  lines.push("");

  const critical = selectedFindings.filter(
    (f) => f.severity === FindingSeverity.Critical
  );
  const major = selectedFindings.filter(
    (f) => f.severity === FindingSeverity.Major
  );
  const minor = selectedFindings.filter(
    (f) => f.severity === FindingSeverity.Minor
  );

  if (critical.length > 0) {
    lines.push("── CRITICAL (must be corrected) ──");
    lines.push("");
    critical.forEach((f, i) => {
      lines.push(`${i + 1}. ${f.title}`);
      lines.push(`   Location: ${f.location}, Page ${f.pageNumber}`);
      if (f.sourceValue)
        lines.push(`   Approved value: ${f.sourceValue}`);
      if (f.supplierValue)
        lines.push(`   Supplier value: ${f.supplierValue}`);
      else lines.push(`   Supplier value: MISSING`);
      lines.push(`   ${f.description}`);
      lines.push("");
    });
  }

  if (major.length > 0) {
    lines.push("── MAJOR (correction required) ──");
    lines.push("");
    major.forEach((f, i) => {
      lines.push(`${i + 1}. ${f.title}`);
      lines.push(`   Location: ${f.location}, Page ${f.pageNumber}`);
      if (f.sourceValue)
        lines.push(`   Approved value: ${f.sourceValue}`);
      if (f.supplierValue)
        lines.push(`   Supplier value: ${f.supplierValue}`);
      else lines.push(`   Supplier value: MISSING`);
      lines.push(`   ${f.description}`);
      lines.push("");
    });
  }

  if (minor.length > 0) {
    lines.push("── MINOR (review recommended) ──");
    lines.push("");
    minor.forEach((f, i) => {
      lines.push(`${i + 1}. ${f.title}`);
      lines.push(`   Location: ${f.location}, Page ${f.pageNumber}`);
      if (f.sourceValue)
        lines.push(`   Approved value: ${f.sourceValue}`);
      if (f.supplierValue)
        lines.push(`   Supplier value: ${f.supplierValue}`);
      lines.push(`   ${f.description}`);
      lines.push("");
    });
  }

  lines.push("──────────────────────────────────");
  lines.push("");
  lines.push(
    "Please submit a revised proof addressing all items marked Critical and Major. Minor items are noted for your review."
  );
  lines.push("");
  lines.push(
    "A revised proof must be submitted for re-inspection before production can proceed."
  );
  lines.push("");
  lines.push("Regards,");
  lines.push(inspection.reviewerName);
  lines.push("Quality Assurance Team");

  return lines.join("\n");
}

export function CorrectionRequestContent({
  inspection,
  findings,
  onMarkSent,
}: CorrectionRequestContentProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(findings.map((f) => f.id))
  );
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  const selectedFindings = useMemo(
    () => findings.filter((f) => selectedIds.has(f.id)),
    [findings, selectedIds]
  );

  const [emailDraft, setEmailDraft] = useState(() =>
    generateEmailDraft(inspection, findings)
  );

  const toggleFinding = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const regenerateEmail = () => {
    setEmailDraft(generateEmailDraft(inspection, selectedFindings));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(emailDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkSent = () => {
    setSent(true);
    onMarkSent();
  };

  return (
    <div className="space-y-6">
      {/* Inspection details */}
      <Card className="border border-border shadow-none">
        <CardContent className="grid grid-cols-3 gap-4 p-5">
          <div>
            <p className="text-xs text-muted-foreground">Supplier</p>
            <p className="text-sm font-medium text-foreground">
              Pacific Print Solutions
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Product</p>
            <p className="text-sm font-medium text-foreground">
              {inspection.title}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">SKU / Revision</p>
            <p className="text-sm font-medium text-foreground">
              {inspection.sku} · {inspection.revision}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* Finding selection */}
        <div className="col-span-1 space-y-3">
          <Card className="border border-border shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Include Findings
                <span className="ml-2 font-normal text-muted-foreground">
                  ({selectedIds.size}/{findings.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto space-y-1.5 pb-3">
              {findings.map((finding) => {
                const config = severityConfig[finding.severity];
                const Icon = config.icon;
                const isSelected = selectedIds.has(finding.id);
                return (
                  <label
                    key={finding.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 transition-colors",
                      isSelected
                        ? "border-primary/30 bg-primary/5"
                        : "border-border hover:bg-accent/50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleFinding(finding.id)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-border accent-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Icon
                          className={cn("h-3 w-3 shrink-0", config.badgeClass.includes("red") ? "text-red-600" : config.badgeClass.includes("amber") ? "text-amber-600" : "text-slate-500")}
                        />
                        <span className="truncate text-xs font-medium text-foreground">
                          {finding.title}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("shrink-0 text-[10px]", config.badgeClass)}
                    >
                      {config.label}
                    </Badge>
                  </label>
                );
              })}
            </CardContent>
          </Card>

          <Button
            variant="outline"
            size="sm"
            onClick={regenerateEmail}
            className="w-full"
          >
            Regenerate Draft
          </Button>
        </div>

        {/* Email draft */}
        <div className="col-span-2">
          <Card className="border border-border shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Correction Request Draft</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs leading-relaxed text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={24}
              />

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  No email will be sent. This is a draft preview only.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={sent}
                  >
                    {copied ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied" : "Copy Email"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleMarkSent}
                    disabled={sent}
                    className={cn(sent && "bg-emerald-600 hover:bg-emerald-600")}
                  >
                    {sent ? (
                      <CheckCircle className="h-3.5 w-3.5" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    {sent ? "Marked as Sent" : "Mark as Sent"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function CorrectionRequestWrapper({
  inspectionId,
}: {
  inspectionId: string;
}) {
  const {
    data: inspection,
    isLoading: loadingInspection,
    isError: inspectionError,
  } = useInspection(inspectionId);
  const {
    data: findings = [],
    isLoading: loadingFindings,
    isError: findingsError,
  } = useFindings(inspectionId);

  const handleMarkSent = useCallback(async () => {
    await addAuditEvent({
      inspectionId,
      action: AuditAction.CorrectionRequestSent,
      actor: inspection?.reviewerName ?? "Unknown",
      metadata: {
        findingsIncluded: String(findings.length),
        supplier: "Pacific Print Solutions",
      },
    });
  }, [inspectionId, inspection?.reviewerName, findings.length]);

  if (loadingInspection || loadingFindings) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (inspectionError || findingsError) {
    return (
      <ErrorState description="We couldn't load this correction request. Please try again." />
    );
  }

  if (!inspection) {
    return (
      <ErrorState
        title="Inspection not found"
        description="This inspection may have been reset or does not exist."
      />
    );
  }

  if (findings.length === 0) {
    return (
      <EmptyState
        title="No findings to correct"
        description="This inspection has no detected differences, so there is nothing to request a correction for."
      />
    );
  }

  return (
    <CorrectionRequestContent
      inspection={inspection}
      findings={findings}
      onMarkSent={handleMarkSent}
    />
  );
}
