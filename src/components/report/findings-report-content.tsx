"use client";

import {
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle,
  FileText,
  CheckSquare,
  Square,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Inspection, Finding } from "@/domain/models";
import { FindingSeverity, FindingCategory } from "@/domain/enums";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useInspection, useFindings } from "@/hooks/use-inspections";
import { ErrorState } from "@/components/shared/state-views";
import { InfoTooltip } from "@/components/shared/info-tooltip";
import {
  isPotentialMismatch,
  whyFlagged,
  HUMAN_CONFIRMATION_NOTE,
  SEVERITY_DEFINITIONS,
} from "@/lib/findings";

interface FindingsReportContentProps {
  inspectionId: string;
}

const severityConfig = {
  [FindingSeverity.Critical]: {
    icon: AlertCircle,
    label: "Critical",
    color: "text-red-600",
    bgColor: "bg-red-50",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
  },
  [FindingSeverity.Major]: {
    icon: AlertTriangle,
    label: "Major",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
  },
  [FindingSeverity.Minor]: {
    icon: Info,
    label: "Minor",
    color: "text-slate-500",
    bgColor: "bg-slate-50",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

const categoryLabels: Record<FindingCategory, string> = {
  [FindingCategory.TextContent]: "Text Content",
  [FindingCategory.Barcode]: "Barcode / QR",
  [FindingCategory.Symbol]: "Symbols",
  [FindingCategory.Layout]: "Layout",
  [FindingCategory.Color]: "Color",
  [FindingCategory.Typography]: "Typography",
  [FindingCategory.Metadata]: "Metadata",
  [FindingCategory.MissingElement]: "Missing Elements",
};

const REVIEW_CHECKLIST = [
  { id: "ck_1", label: "All critical findings have been individually reviewed" },
  { id: "ck_2", label: "Barcode values confirmed against approved specification" },
  { id: "ck_3", label: "Regulatory text and symbols verified" },
  { id: "ck_4", label: "Storage and handling instructions checked" },
  { id: "ck_5", label: "Visual layout and brand consistency assessed" },
  { id: "ck_6", label: "Recommendation reviewed and confirmed by reviewer" },
];

function generateSummary(inspection: Inspection, findings: Finding[]): string {
  const critical = findings.filter((f) => f.severity === FindingSeverity.Critical);
  const major = findings.filter((f) => f.severity === FindingSeverity.Major);
  const minor = findings.filter((f) => f.severity === FindingSeverity.Minor);

  const parts: string[] = [];

  parts.push(
    `The comparison identified ${findings.length} potential differences between the approved master and the supplier proof for "${inspection.title}".`
  );

  if (critical.length > 0) {
    parts.push(
      `${critical.length} critical finding${critical.length > 1 ? "s were" : " was"} detected, including: ${critical.map((f) => f.title.toLowerCase()).join(", ")}.`
    );
  }

  if (major.length > 0) {
    parts.push(
      `${major.length} major finding${major.length > 1 ? "s require" : " requires"} attention: ${major.map((f) => f.title.toLowerCase()).join(", ")}.`
    );
  }

  if (minor.length > 0) {
    parts.push(
      `${minor.length} minor variance${minor.length > 1 ? "s were" : " was"} noted for review.`
    );
  }

  if (inspection.recommendation) {
    parts.push(
      `Based on the structured findings, the recommended action is: ${inspection.recommendation}.`
    );
  }

  return parts.join(" ");
}

export function FindingsReportContent({
  inspectionId,
}: FindingsReportContentProps) {
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
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (loadingInspection || loadingFindings) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (inspectionError || findingsError) {
    return (
      <ErrorState description="We couldn't load this inspection report. Please try again." />
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

  const groupedByCategory = findings.reduce(
    (acc, f) => {
      if (!acc[f.category]) acc[f.category] = [];
      acc[f.category].push(f);
      return acc;
    },
    {} as Record<FindingCategory, Finding[]>
  );

  const toggleCheck = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const hasFindings = findings.length > 0;
  const hasCritical = inspection.findingsCount.critical > 0;
  const recTone = !hasFindings
    ? {
        border: "border-emerald-200",
        bg: "bg-emerald-50",
        icon: CheckCircle2,
        iconColor: "text-emerald-600",
      }
    : hasCritical
      ? {
          border: "border-red-200",
          bg: "bg-red-50",
          icon: XCircle,
          iconColor: "text-red-600",
        }
      : {
          border: "border-amber-200",
          bg: "bg-amber-50",
          icon: AlertTriangle,
          iconColor: "text-amber-600",
        };
  const RecIcon = recTone.icon;

  return (
    <div className="space-y-6">
      {/* Recommendation card */}
      <Card className={cn("border-2 shadow-none", recTone.border)}>
        <CardContent className="flex items-center gap-4 p-5">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              recTone.bg
            )}
          >
            <RecIcon className={cn("h-6 w-6", recTone.iconColor)} />
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-foreground">
              {!hasFindings
                ? "No significant differences found"
                : (inspection.recommendation ?? "Pending Review")}
            </p>
            <p className="text-sm text-muted-foreground">
              {!hasFindings
                ? "Automated checks did not detect differences. A human reviewer should still confirm before approval."
                : `${findings.length} potential ${findings.length === 1 ? "difference" : "differences"} found · requires human confirmation`}
            </p>
          </div>
          {hasFindings && (
            <div className="flex gap-2">
              <SeverityPill
                severity={FindingSeverity.Critical}
                count={inspection.findingsCount.critical}
              />
              <SeverityPill
                severity={FindingSeverity.Major}
                count={inspection.findingsCount.major}
              />
              <SeverityPill
                severity={FindingSeverity.Minor}
                count={inspection.findingsCount.minor}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {generateSummary(inspection, findings)}
          </p>
          <p className="mt-3 flex items-start gap-1.5 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              {HUMAN_CONFIRMATION_NOTE} This summary is generated from structured
              findings only and does not make compliance claims or approval
              decisions.
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Findings grouped by category */}
      {Object.entries(groupedByCategory).map(([category, categoryFindings]) => (
        <Card key={category} className="border border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {categoryLabels[category as FindingCategory]}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({categoryFindings.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[110px] pl-6">
                    <span className="inline-flex items-center gap-1">
                      Severity
                      <InfoTooltip
                        content={`${SEVERITY_DEFINITIONS[FindingSeverity.Critical]} ${SEVERITY_DEFINITIONS[FindingSeverity.Major]} ${SEVERITY_DEFINITIONS[FindingSeverity.Minor]}`}
                      />
                    </span>
                  </TableHead>
                  <TableHead>Finding</TableHead>
                  <TableHead>Approved Value</TableHead>
                  <TableHead>Supplier Value</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[80px] pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryFindings.map((finding) => {
                  const config = severityConfig[finding.severity];
                  const Icon = config.icon;
                  return (
                    <TableRow key={finding.id}>
                      <TableCell className="pl-6">
                        <Badge
                          variant="outline"
                          className={cn("text-xs font-medium", config.badgeClass)}
                        >
                          <Icon className="mr-1 h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[280px] align-top font-medium">
                        <div className="flex items-center gap-1.5">
                          <span>{finding.title}</span>
                          {isPotentialMismatch(finding) && (
                            <span className="inline-flex shrink-0 items-center rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                              Potential mismatch
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs font-normal leading-snug text-muted-foreground">
                          {whyFlagged(finding)}
                        </p>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-emerald-700">
                        {finding.sourceValue ?? "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-red-600">
                        {finding.supplierValue ?? "Missing"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <span>Page {finding.pageNumber}</span>
                        <br />
                        <span>{finding.location}</span>
                      </TableCell>
                      <TableCell className="pr-6">
                        <span className="text-xs text-muted-foreground">
                          {finding.reviewerVerified === true
                            ? "Verified"
                            : finding.reviewerVerified === false
                              ? "Dismissed"
                              : "Pending"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* Human review checklist */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckSquare className="h-4 w-4 text-primary" />
            Human Review Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            Complete all items before making a final approval or rejection
            decision.
          </p>
          <div className="space-y-2">
            {REVIEW_CHECKLIST.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2.5 transition-colors hover:bg-accent has-[:checked]:border-primary/30 has-[:checked]:bg-primary/5"
              >
                <input
                  type="checkbox"
                  checked={!!checked[item.id]}
                  onChange={() => toggleCheck(item.id)}
                  className="sr-only"
                />
                {checked[item.id] ? (
                  <CheckSquare className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Square className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    checked[item.id]
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SeverityPill({
  severity,
  count,
}: {
  severity: FindingSeverity;
  count: number;
}) {
  const config = severityConfig[severity];
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1",
        config.badgeClass
      )}
    >
      <span className="text-sm font-semibold">{count}</span>
      <span className="text-xs">{config.label}</span>
    </div>
  );
}
