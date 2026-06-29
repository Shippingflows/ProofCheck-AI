"use client";

import {
  Plus,
  Upload,
  Play,
  CheckCircle,
  AlertTriangle,
  Eye,
  X,
  FileText,
  Send,
  Printer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditEvent } from "@/domain/models";
import { AuditAction } from "@/domain/enums";
import { cn } from "@/lib/utils";

interface AuditTimelineProps {
  events: AuditEvent[];
}

const actionConfig: Record<
  AuditAction,
  {
    icon: typeof Plus;
    label: string;
    detail: string;
    source: "System" | "Reviewer";
    color: string;
    bgColor: string;
  }
> = {
  [AuditAction.InspectionCreated]: {
    icon: Plus,
    label: "Inspection record created",
    detail: "A new inspection was opened and assigned for review.",
    source: "Reviewer",
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/20",
  },
  [AuditAction.MasterFileUploaded]: {
    icon: Upload,
    label: "Approved master ingested",
    detail: "The approved reference document was attached to the inspection.",
    source: "Reviewer",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-200",
  },
  [AuditAction.SupplierFileUploaded]: {
    icon: Upload,
    label: "Supplier proof ingested",
    detail: "The supplier-submitted production file was attached for comparison.",
    source: "Reviewer",
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
  },
  [AuditAction.ComparisonStarted]: {
    icon: Play,
    label: "Automated comparison initiated",
    detail: "Deterministic checks began. No approval decision is made automatically.",
    source: "System",
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
  },
  [AuditAction.ComparisonCompleted]: {
    icon: CheckCircle,
    label: "Automated comparison completed",
    detail: "Detection finished and results were prepared for human review.",
    source: "System",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-200",
  },
  [AuditAction.FindingsGenerated]: {
    icon: AlertTriangle,
    label: "Findings compiled for review",
    detail: "Detected differences were structured into reviewable findings.",
    source: "System",
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
  },
  [AuditAction.ReviewStarted]: {
    icon: Eye,
    label: "Human review started",
    detail: "A reviewer began examining the detected findings.",
    source: "Reviewer",
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/20",
  },
  [AuditAction.FindingVerified]: {
    icon: CheckCircle,
    label: "Finding confirmed by reviewer",
    detail: "A reviewer confirmed a detected difference as valid.",
    source: "Reviewer",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-200",
  },
  [AuditAction.FindingDismissed]: {
    icon: X,
    label: "Finding dismissed by reviewer",
    detail: "A reviewer judged a detected difference to be a non-issue.",
    source: "Reviewer",
    color: "text-slate-500",
    bgColor: "bg-slate-50 border-slate-200",
  },
  [AuditAction.DecisionMade]: {
    icon: FileText,
    label: "Final decision recorded",
    detail: "A reviewer recorded the disposition for this inspection.",
    source: "Reviewer",
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/20",
  },
  [AuditAction.CorrectionRequestSent]: {
    icon: Send,
    label: "Supplier correction request prepared",
    detail: "A correction request was drafted and marked as sent to the supplier.",
    source: "Reviewer",
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
  },
  [AuditAction.ReportExported]: {
    icon: Printer,
    label: "Report exported",
    detail: "A print-ready inspection report was generated.",
    source: "Reviewer",
    color: "text-slate-600",
    bgColor: "bg-slate-50 border-slate-200",
  },
};

export function AuditTimeline({ events }: AuditTimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Audit Trail</CardTitle>
        <p className="text-xs text-muted-foreground">
          Chronological record of system actions and reviewer decisions for this
          inspection.
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {sortedEvents.map((event, idx) => {
            const config = actionConfig[event.action];
            const Icon = config.icon;
            const isLast = idx === sortedEvents.length - 1;

            return (
              <div key={event.id} className="flex gap-4">
                {/* Timeline line + dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                      config.bgColor
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-border" />}
                </div>

                {/* Content */}
                <div className={cn("flex-1 pb-6", isLast && "pb-0")}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {config.label}
                        </p>
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-medium",
                            config.source === "System"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {config.source}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {config.detail}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {event.actor} ({event.actorRole.replace(/_/g, " ")}) ·{" "}
                        {event.timestampLocal}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                        {event.eventId} · source: {event.source}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  {Object.keys(event.metadata).length > 0 && (
                    <div className="mt-2 rounded-md bg-muted/50 px-3 py-2">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="text-muted-foreground">
                              {formatMetaKey(key)}:
                            </span>{" "}
                            <span className="font-medium text-foreground">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function formatMetaKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}
