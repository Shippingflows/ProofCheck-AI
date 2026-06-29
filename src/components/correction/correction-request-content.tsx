"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Send,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  Calendar,
  Save,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Finding, Inspection } from "@/domain/models";
import { FindingSeverity, AuditAction, CorrectionStatus } from "@/domain/enums";
import { cn } from "@/lib/utils";
import { useInspection, useFindings } from "@/hooks/use-inspections";
import { addAuditEvent, updateInspection } from "@/data/mock-repository";
import { CorrectionStatusTracker } from "@/components/shared/correction-status-tracker";
import { ErrorState, EmptyState } from "@/components/shared/state-views";
import { DEMO_SUPPLIER_EMAIL } from "@/data/seed";

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
    iconClass: "text-red-600",
  },
  [FindingSeverity.Major]: {
    icon: AlertTriangle,
    label: "Major",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    iconClass: "text-amber-600",
  },
  [FindingSeverity.Minor]: {
    icon: Info,
    label: "Minor",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
    iconClass: "text-slate-500",
  },
};

function generateEmailSubject(inspection: Inspection): string {
  return `Correction Required: BioTouch Sample Collection Kit Proof ${inspection.sku} ${inspection.revision}`;
}

function generateEmailBody(
  inspection: Inspection,
  selectedFindings: Finding[]
): string {
  const lines: string[] = [];

  lines.push(`Hi ${inspection.supplierName || "Pacific Print Solutions"},`);
  lines.push("");
  lines.push(
    `We completed a structured proof review for ${inspection.title} (SKU ${inspection.sku}, revision ${inspection.revision}) against the approved master.`
  );
  lines.push("");
  lines.push(
    "The supplier proof does not match the approved master in the areas listed below. Please correct each item and resubmit a revised proof file for re-inspection."
  );
  lines.push("");
  lines.push("Summary of required corrections:");

  const critical = selectedFindings.filter(
    (f) => f.severity === FindingSeverity.Critical
  );
  const major = selectedFindings.filter(
    (f) => f.severity === FindingSeverity.Major
  );
  const minor = selectedFindings.filter(
    (f) => f.severity === FindingSeverity.Minor
  );

  let counter = 1;

  if (critical.length > 0) {
    lines.push("Critical:");
    critical.forEach((f) => {
      lines.push(`${counter}. ${f.title}`);
      if (f.sourceValue) lines.push(`   Approved: ${f.sourceValue}`);
      if (f.supplierValue) lines.push(`   Supplier proof: ${f.supplierValue}`);
      else lines.push(`   Supplier proof: Missing`);
      if (f.location) lines.push(`   Location: ${f.location}`);
      lines.push("");
      counter++;
    });
  }

  if (major.length > 0) {
    lines.push("Major:");
    major.forEach((f) => {
      lines.push(`${counter}. ${f.title}`);
      if (f.sourceValue) lines.push(`   Approved: ${f.sourceValue}`);
      if (f.supplierValue) lines.push(`   Supplier proof: ${f.supplierValue}`);
      if (f.location) lines.push(`   Location: ${f.location}`);
      lines.push("");
      counter++;
    });
  }

  if (minor.length > 0) {
    lines.push("Minor:");
    minor.forEach((f) => {
      lines.push(`${counter}. ${f.title}`);
      lines.push("");
      counter++;
    });
  }

  lines.push(
    "Please resubmit an updated proof with these corrections applied."
  );
  lines.push("");
  lines.push("Regards,");
  lines.push(inspection.reviewerName);
  lines.push("Quality Review");

  return lines.join("\n");
}

export function CorrectionRequestContent({
  inspection,
  findings,
  onMarkSent,
}: CorrectionRequestContentProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(findings.map((f) => f.id))
  );
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [dueDate, setDueDate] = useState("");

  const selectedFindings = useMemo(
    () => findings.filter((f) => selectedIds.has(f.id)),
    [findings, selectedIds]
  );

  const [subject, setSubject] = useState(() => generateEmailSubject(inspection));
  const [emailBody, setEmailBody] = useState(() =>
    generateEmailBody(inspection, findings)
  );

  const toggleFinding = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const regenerateDraft = () => {
    setSubject(generateEmailSubject(inspection));
    setEmailBody(generateEmailBody(inspection, selectedFindings));
  };

  const fullEmailText = `To: ${DEMO_SUPPLIER_EMAIL}\nSubject: ${subject}\n\n${emailBody}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullEmailText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveDraft = () => {
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const handleMarkSent = () => {
    setSent(true);
    onMarkSent();
  };

  return (
    <div className="space-y-6 pb-24">
      <CorrectionStatusTracker status={inspection.correctionStatus} />

      {/* Inspection details */}
      <Card className="border border-border shadow-none">
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Supplier</p>
            <p className="text-sm font-medium text-foreground">
              {inspection.supplierName}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Finding selection */}
        <div className="space-y-3">
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
                        <Icon className={cn("h-3 w-3 shrink-0", config.iconClass)} />
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
            onClick={regenerateDraft}
            className="w-full"
          >
            Regenerate Draft
          </Button>
        </div>

        {/* Email draft */}
        <div className="flex min-h-0 flex-col lg:col-span-2">
          <Card className="flex min-h-0 flex-1 flex-col border border-border shadow-none">
            <CardHeader className="shrink-0 pb-2">
              <CardTitle className="text-sm">Correction Request Draft</CardTitle>
              <p className="text-xs text-muted-foreground">
                Review the generated supplier correction request before sending.
              </p>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col space-y-4">
              <div className="shrink-0 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <div className="rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-foreground">
                  {DEMO_SUPPLIER_EMAIL}
                </div>
              </div>

              <div className="shrink-0 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex min-h-0 flex-1 flex-col space-y-1">
                <label className="shrink-0 text-xs font-medium text-muted-foreground">
                  Email preview
                </label>
                <div className="flex min-h-[min(52vh,520px)] flex-1 flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm">
                  <div className="shrink-0 border-b border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">To:</span>{" "}
                      {DEMO_SUPPLIER_EMAIL}
                    </p>
                    <p className="mt-0.5">
                      <span className="font-medium text-foreground">Subject:</span>{" "}
                      {subject}
                    </p>
                  </div>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="min-h-0 flex-1 resize-none overflow-y-scroll px-4 py-3 font-sans text-sm leading-relaxed text-foreground focus-visible:outline-none [scrollbar-gutter:stable]"
                    rows={20}
                  />
                </div>
              </div>

              <div className="shrink-0 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Included findings ({selectedFindings.length})
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedFindings.length === 0 ? (
                    <span className="text-xs text-muted-foreground">None selected</span>
                  ) : (
                    selectedFindings.map((f) => {
                      const config = severityConfig[f.severity];
                      return (
                        <Badge
                          key={f.id}
                          variant="outline"
                          className={cn("text-[10px]", config.badgeClass)}
                        >
                          {f.title}
                        </Badge>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="shrink-0 space-y-1">
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Supplier response due date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <p className="shrink-0 text-xs text-muted-foreground">
                Pilot workspace — email is not sent automatically.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-[238px] right-0 z-30 border-t border-border bg-card/95 px-6 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur supports-[backdrop-filter]:bg-card/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Actions apply to the draft above — nothing is sent automatically.
          </p>
          <div className="flex flex-wrap gap-2">
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
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={sent}
            >
              {draftSaved ? (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {draftSaved ? "Draft Saved" : "Save Draft"}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/report")}
            >
              <FileText className="h-3.5 w-3.5" />
              Preview Report
            </Button>
          </div>
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
    await updateInspection(inspectionId, {
      correctionStatus: CorrectionStatus.SentToSupplier,
    });
    await addAuditEvent({
      inspectionId,
      action: AuditAction.CorrectionRequestSent,
      actor: inspection?.reviewerName ?? "Unknown",
      metadata: {
        findingsIncluded: String(findings.length),
        supplier: inspection?.supplierName || "Pacific Print Solutions",
        correctionStatus: CorrectionStatus.SentToSupplier,
      },
    });
  }, [inspectionId, inspection?.reviewerName, inspection?.supplierName, findings.length]);

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
