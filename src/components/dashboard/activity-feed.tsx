"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuditEvents } from "@/hooks/use-inspections";
import { AuditAction } from "@/domain/enums";
import { LoadingState, ErrorState } from "@/components/shared/state-views";
import {
  Upload,
  Play,
  CheckCircle,
  AlertTriangle,
  FileText,
  Eye,
  Send,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

function actionIcon(action: AuditAction) {
  switch (action) {
    case AuditAction.InspectionCreated:
      return Plus;
    case AuditAction.MasterFileUploaded:
    case AuditAction.SupplierFileUploaded:
      return Upload;
    case AuditAction.ComparisonStarted:
      return Play;
    case AuditAction.ComparisonCompleted:
      return CheckCircle;
    case AuditAction.FindingsGenerated:
      return AlertTriangle;
    case AuditAction.ReviewStarted:
      return Eye;
    case AuditAction.DecisionMade:
      return FileText;
    case AuditAction.CorrectionRequestSent:
      return Send;
    default:
      return FileText;
  }
}

function actionLabel(action: AuditAction): string {
  const map: Record<AuditAction, string> = {
    [AuditAction.InspectionCreated]: "Inspection created",
    [AuditAction.MasterFileUploaded]: "Master file uploaded",
    [AuditAction.SupplierFileUploaded]: "Supplier file uploaded",
    [AuditAction.ComparisonStarted]: "Comparison started",
    [AuditAction.ComparisonCompleted]: "Comparison completed",
    [AuditAction.FindingsGenerated]: "Findings generated",
    [AuditAction.ReviewStarted]: "Review started",
    [AuditAction.FindingVerified]: "Finding verified",
    [AuditAction.FindingDismissed]: "Finding dismissed",
    [AuditAction.DecisionMade]: "Decision made",
    [AuditAction.CorrectionRequestSent]: "Correction request sent",
    [AuditAction.ReportExported]: "Report exported",
  };
  return map[action];
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ActivityFeed() {
  const { data: events, isLoading, isError } = useAuditEvents();

  const recentEvents = events?.slice(0, 10) ?? [];

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <LoadingState label="Loading activity…" className="py-8" />}
        {isError && (
          <ErrorState description="We couldn't load recent activity." />
        )}
        {!isLoading && !isError && recentEvents.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No activity recorded yet.
          </p>
        )}
        <div className="space-y-0">
          {recentEvents.map((event, idx) => {
            const Icon = actionIcon(event.action);
            const isLast = idx === recentEvents.length - 1;

            return (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  {!isLast && (
                    <div className="w-px flex-1 bg-border" />
                  )}
                </div>
                <div className={cn("pb-4", isLast && "pb-0")}>
                  <p className="text-sm font-medium text-foreground">
                    {actionLabel(event.action)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event.actor} &middot; {formatTimestamp(event.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
