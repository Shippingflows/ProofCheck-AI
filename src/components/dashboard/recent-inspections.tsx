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
import { InspectionStatus } from "@/domain/enums";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { FileSearch } from "lucide-react";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/shared/state-views";
import { DemoBadge } from "@/components/shared/demo-badge";
import { isDemoInspection } from "@/lib/demo";

function statusLabel(status: InspectionStatus): string {
  const map: Record<InspectionStatus, string> = {
    [InspectionStatus.Draft]: "Draft",
    [InspectionStatus.Uploading]: "Uploading",
    [InspectionStatus.Comparing]: "Comparing",
    [InspectionStatus.PendingReview]: "Pending Review",
    [InspectionStatus.Approved]: "Approved",
    [InspectionStatus.Rejected]: "Rejected",
  };
  return map[status];
}

function statusVariant(status: InspectionStatus) {
  switch (status) {
    case InspectionStatus.Approved:
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

function formatDate(dateStr: string): string {
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
              <TableHead>SKU</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Findings</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="pr-6">Reviewer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inspections.map((inspection) => (
              <TableRow
                key={inspection.id}
                className="cursor-pointer"
                onClick={() => router.push(`/comparison/${inspection.id}`)}
              >
                <TableCell className="max-w-[280px] pl-6 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{inspection.title}</span>
                    {isDemoInspection(inspection.id) && <DemoBadge />}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {inspection.sku}
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
                <TableCell>
                  <FindingsBadges counts={inspection.findingsCount} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(inspection.createdAt)}
                </TableCell>
                <TableCell className="pr-6 text-sm text-muted-foreground">
                  {inspection.reviewerName}
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

function FindingsBadges({
  counts,
}: {
  counts: { critical: number; major: number; minor: number };
}) {
  const total = counts.critical + counts.major + counts.minor;
  if (total === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      {counts.critical > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded px-1 bg-red-100 text-xs font-medium text-red-700">
          {counts.critical}
        </span>
      )}
      {counts.major > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded px-1 bg-amber-100 text-xs font-medium text-amber-700">
          {counts.major}
        </span>
      )}
      {counts.minor > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded px-1 bg-slate-100 text-xs font-medium text-slate-600">
          {counts.minor}
        </span>
      )}
    </div>
  );
}
