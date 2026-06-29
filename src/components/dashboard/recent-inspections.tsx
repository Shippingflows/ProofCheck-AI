"use client";

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
import { useInspections } from "@/hooks/use-inspections";
import { CorrectionStatus, InspectionStatus } from "@/domain/enums";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { FileSearch } from "lucide-react";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/shared/state-views";
import { formatSeverityCounts } from "@/lib/format-severity";
import { correctionStatusLabel } from "@/lib/correction-status";

function statusLabel(status: InspectionStatus): string {
  const map: Record<InspectionStatus, string> = {
    [InspectionStatus.Draft]: "Draft",
    [InspectionStatus.Uploading]: "Uploading",
    [InspectionStatus.Comparing]: "Comparing",
    [InspectionStatus.PendingReview]: "Pending Review",
    [InspectionStatus.Approved]: "Approved",
    [InspectionStatus.ApprovedWithNotes]: "Approved w/ Notes",
    [InspectionStatus.Rejected]: "Rejected",
  };
  return map[status];
}

function statusVariant(status: InspectionStatus) {
  switch (status) {
    case InspectionStatus.Approved:
    case InspectionStatus.ApprovedWithNotes:
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case InspectionStatus.Rejected:
      return "bg-red-50 text-red-700 border-red-200";
    case InspectionStatus.PendingReview:
      return "bg-amber-50 text-amber-700 border-amber-200";
    case InspectionStatus.Comparing:
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RecentInspections() {
  const { data: inspections, isLoading, isError } = useInspections();
  const router = useRouter();

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Recent Inspections</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {isLoading && <LoadingState label="Loading inspections…" />}
        {isError && (
          <div className="px-6 pb-6">
            <ErrorState description="We couldn't load recent inspections. Please try again." />
          </div>
        )}
        {!isLoading && !isError && inspections && inspections.length === 0 && (
          <div className="px-6 pb-6">
            <EmptyState
              icon={FileSearch}
              title="No inspections yet"
              description="Create your first inspection to compare an approved master against a supplier proof."
              action={{
                label: "New Inspection",
                onClick: () => router.push("/inspections/new"),
              }}
            />
          </div>
        )}
        {!isLoading && !isError && inspections && inspections.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Title</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Revision</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Findings</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead className="pr-6">Correction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inspections.map((inspection) => (
              <TableRow
                key={inspection.id}
                className="cursor-pointer"
                onClick={() => router.push(`/comparison/${inspection.id}`)}
              >
                <TableCell className="max-w-[200px] pl-6 font-medium">
                  <span className="truncate">{inspection.title}</span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {inspection.supplierName || "—"}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {inspection.sku}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {inspection.revision}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium",
                      statusVariant(inspection.status)
                    )}
                  >
                    {statusLabel(inspection.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-foreground">
                  {formatSeverityCounts(inspection.findingsCount)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(inspection.dueDate)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {inspection.reviewerName}
                </TableCell>
                <TableCell className="pr-6 text-xs text-muted-foreground">
                  {inspection.correctionStatus === CorrectionStatus.NotStarted
                    ? "—"
                    : correctionStatusLabel(inspection.correctionStatus)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
}
