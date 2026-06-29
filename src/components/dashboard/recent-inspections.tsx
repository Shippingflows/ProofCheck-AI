"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <Card className="overflow-hidden rounded-[3px] border border-border shadow-none">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <span className="text-[13px] font-semibold text-foreground">Recent Inspections</span>
        <Button
          size="sm"
          className="h-7 rounded-[3px] px-3 text-xs"
          onClick={() => router.push("/inspections/new")}
        >
          + New Proof Review
        </Button>
      </div>
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
                label: "New Supplier Proof Review",
                onClick: () => router.push("/inspections/new"),
              }}
            />
          </div>
        )}
        {!isLoading && !isError && inspections && inspections.length > 0 && (
          <div className="overflow-x-auto">
          <Table className="table-fixed min-w-[860px]">
            <TableHeader>
              <TableRow className="border-b border-border bg-secondary hover:bg-secondary">
                <TableHead className="w-[24%] pl-5 text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Title
                </TableHead>
                <TableHead className="w-[14%] text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Supplier
                </TableHead>
                <TableHead className="w-[9%] text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  SKU
                </TableHead>
                <TableHead className="w-[7%] text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Revision
                </TableHead>
                <TableHead className="w-[11%] text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="w-[14%] text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Findings
                </TableHead>
                <TableHead className="w-[8%] text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Due
                </TableHead>
                <TableHead className="w-[8%] text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Reviewer
                </TableHead>
                <TableHead className="w-[5%] pr-5 text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Correction
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspections.map((inspection) => (
                <TableRow
                  key={inspection.id}
                  className="cursor-pointer border-b border-[#f0eee9] hover:bg-secondary"
                  onClick={() => router.push(`/comparison/${inspection.id}`)}
                >
                  <TableCell className="max-w-0 py-2.5 pl-5 font-medium">
                    <span
                      className="block truncate"
                      title={inspection.title}
                    >
                      {inspection.title}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-0 text-sm text-muted-foreground">
                    <span
                      className="block truncate"
                      title={inspection.supplierName || "—"}
                    >
                      {inspection.supplierName || "—"}
                    </span>
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
                  <TableCell className="whitespace-normal text-xs leading-snug text-foreground">
                    {formatSeverityCounts(inspection.findingsCount)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(inspection.dueDate)}
                  </TableCell>
                  <TableCell className="max-w-0 text-sm text-muted-foreground">
                    <span className="block truncate">{inspection.reviewerName}</span>
                  </TableCell>
                  <TableCell className="pr-5 text-xs text-muted-foreground">
                    {inspection.correctionStatus === CorrectionStatus.NotStarted
                      ? "—"
                      : correctionStatusLabel(inspection.correctionStatus)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
