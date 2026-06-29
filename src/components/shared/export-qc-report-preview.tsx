"use client";

import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inspection } from "@/domain/models";
import { formatSeverityCounts } from "@/lib/format-severity";
import {
  RECOMMENDATION_PENDING_NOTE,
  formatRecommendation,
} from "@/lib/recommendations";

interface ExportQcReportPreviewProps {
  inspection: Inspection;
  onExport?: () => void;
}

export function ExportQcReportPreview({
  inspection,
  onExport,
}: ExportQcReportPreviewProps) {
  const rec = inspection.recommendation
    ? formatRecommendation(inspection.recommendation)
    : null;

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4" />
            Export QC Report PDF
          </CardTitle>
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-3.5 w-3.5" />
              Preview
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 border-t border-dashed border-border pt-3 text-xs">
        <PreviewRow label="Inspection" value={inspection.title} />
        <PreviewRow label="SKU / Revision" value={`${inspection.sku} · ${inspection.revision}`} />
        <PreviewRow label="Supplier" value={inspection.supplierName || "—"} />
        <PreviewRow
          label="Findings"
          value={formatSeverityCounts(inspection.findingsCount)}
        />
        <PreviewRow
          label="Recommendation"
          value={rec?.action ?? "Pending review"}
        />
        <PreviewRow
          label="QA status"
          value={rec?.note ?? RECOMMENDATION_PENDING_NOTE}
        />
        <PreviewRow label="Reviewer" value={inspection.reviewerName} />
        <p className="pt-1 text-[11px] italic text-muted-foreground">
          Preview reflects current inspection state. Final PDF includes audit trail
          and file hashes.
        </p>
      </CardContent>
    </Card>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
