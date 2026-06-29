"use client";

import { Loader2, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { ApprovalDecision } from "@/components/audit/approval-decision";
import { AuditTimeline } from "@/components/audit/audit-timeline";
import { useInspection, useAuditEvents } from "@/hooks/use-inspections";
import { addAuditEvent } from "@/data/mock-repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuditAction } from "@/domain/enums";
import { ErrorState } from "@/components/shared/state-views";
import { InspectionProfileCard } from "@/components/shared/inspection-profile-card";
import { ReviewerChecklistPanel } from "@/components/shared/reviewer-checklist-panel";
import { WhatProofCheckReviews } from "@/components/shared/what-proofcheck-reviews";
import { FileLineageCard } from "@/components/shared/file-lineage-card";
import { AuditIntegrityBlock } from "@/components/shared/audit-integrity-block";
import { ExportQcReportPreview } from "@/components/shared/export-qc-report-preview";
import { CorrectionStatusTracker } from "@/components/shared/correction-status-tracker";

interface AuditPageContentProps {
  inspectionId: string;
}

export function AuditPageContent({ inspectionId }: AuditPageContentProps) {
  const {
    data: inspection,
    isLoading: loadingInspection,
    isError: inspectionError,
  } = useInspection(inspectionId);
  const {
    data: events = [],
    isLoading: loadingEvents,
    isError: eventsError,
  } = useAuditEvents(inspectionId);
  const router = useRouter();

  const handleExport = async () => {
    await addAuditEvent({
      inspectionId,
      action: AuditAction.ReportExported,
      actor: inspection?.reviewerName ?? "Unknown",
      metadata: { format: "print" },
    });
    router.push("/report/print");
  };

  if (loadingInspection || loadingEvents) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (inspectionError || eventsError) {
    return (
      <ErrorState description="We couldn't load this approval record. Please try again." />
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

  return (
  <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Approval Record &amp; Audit Trail
          </h2>
          <p className="text-sm text-muted-foreground">
            {inspection.title}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Printer className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InspectionProfileCard profileRef={inspection.profileRef} />
        <WhatProofCheckReviews />
      </div>

      <CorrectionStatusTracker status={inspection.correctionStatus} />

      <Card className="border border-border shadow-none">
        <CardContent className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Inspection</p>
            <p className="text-sm font-medium text-foreground truncate">
              {inspection.title}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">SKU / Rev</p>
            <p className="text-sm font-medium text-foreground">
              {inspection.sku} · {inspection.revision}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Reviewer</p>
            <p className="text-sm font-medium text-foreground">
              {inspection.reviewerName}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-medium text-foreground capitalize">
              {inspection.status.replace(/_/g, " ")}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <FileLineageCard inspection={inspection} />
        <AuditIntegrityBlock
          events={events}
          masterHash={inspection.masterFileHash}
          supplierHash={inspection.supplierFileHash}
        />
      </div>

      <ExportQcReportPreview inspection={inspection} onExport={handleExport} />

      <ApprovalDecision inspectionId={inspectionId} />

      <ReviewerChecklistPanel
        inspectionId={inspectionId}
        completed={inspection.checklistCompleted}
      />

      <AuditTimeline events={events} />
    </div>
  );
}
