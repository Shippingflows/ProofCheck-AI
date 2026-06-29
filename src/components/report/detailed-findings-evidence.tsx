"use client";

import Image from "next/image";
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
import { Finding } from "@/domain/models";
import { FindingSeverity, FindingCategory } from "@/domain/enums";
import { cn } from "@/lib/utils";
import { confidencePercent } from "@/lib/findings";

const severityBadge: Record<FindingSeverity, string> = {
  [FindingSeverity.Critical]: "bg-red-100 text-red-700 border-red-200",
  [FindingSeverity.Major]: "bg-amber-100 text-amber-700 border-amber-200",
  [FindingSeverity.Minor]: "bg-slate-100 text-slate-600 border-slate-200",
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

function reviewerStatus(finding: Finding): string {
  if (finding.reviewerVerified === true) return "Verified";
  if (finding.reviewerVerified === false) return "Dismissed";
  return "Pending";
}

function formatFindingId(id: string): string {
  return id.replace("find_", "FIND-").toUpperCase();
}

interface DetailedFindingsEvidenceProps {
  findings: Finding[];
}

export function DetailedFindingsEvidence({ findings }: DetailedFindingsEvidenceProps) {
  if (findings.length === 0) return null;

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Detailed Findings Evidence</CardTitle>
        <p className="text-xs text-muted-foreground">
          Full evidence rows for procurement and quality review — each finding
          includes extracted values, detection metadata, and evidence snapshots.
        </p>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[88px] pl-6">Finding ID</TableHead>
              <TableHead className="w-[80px]">Severity</TableHead>
              <TableHead className="w-[100px]">Category</TableHead>
              <TableHead className="w-[140px]">Finding</TableHead>
              <TableHead className="w-[100px]">Approved</TableHead>
              <TableHead className="w-[100px]">Supplier</TableHead>
              <TableHead className="w-[110px]">Location</TableHead>
              <TableHead className="w-[100px]">Detection</TableHead>
              <TableHead className="w-[56px]">Conf.</TableHead>
              <TableHead className="w-[72px]">Evidence</TableHead>
              <TableHead className="w-[72px] pr-6">Reviewer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {findings.map((finding) => (
              <TableRow key={finding.id} className="align-top">
                <TableCell className="pl-6 font-mono text-[10px] text-muted-foreground">
                  {formatFindingId(finding.id)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] capitalize", severityBadge[finding.severity])}
                  >
                    {finding.severity}
                  </Badge>
                </TableCell>
                <TableCell className="text-[11px] text-muted-foreground">
                  {categoryLabels[finding.category]}
                </TableCell>
                <TableCell className="text-xs font-medium leading-snug">
                  {finding.title}
                </TableCell>
                <TableCell className="break-words font-mono text-[11px] text-emerald-700">
                  {finding.sourceValue ?? "—"}
                </TableCell>
                <TableCell className="break-words font-mono text-[11px] text-red-600">
                  {finding.supplierValue ?? "Missing"}
                </TableCell>
                <TableCell className="text-[11px] text-muted-foreground">
                  <span>Pg {finding.pageNumber}</span>
                  <br />
                  <span className="leading-snug">{finding.location}</span>
                </TableCell>
                <TableCell className="break-words text-[11px] text-muted-foreground">
                  {finding.detectionMethod}
                </TableCell>
                <TableCell className="text-[11px] font-medium">
                  {confidencePercent(finding)}%
                </TableCell>
                <TableCell>
                  {finding.masterEvidenceSrc ? (
                    <Image
                      src={finding.masterEvidenceSrc}
                      alt="Evidence"
                      width={64}
                      height={24}
                      className="rounded border border-border"
                      unoptimized
                    />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="pr-6 text-[11px] text-muted-foreground">
                  {reviewerStatus(finding)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
