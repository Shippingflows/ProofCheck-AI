"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useStats } from "@/hooks/use-inspections";
import {
  FileText,
  Clock,
  Send,
  XCircle,
  Timer,
} from "lucide-react";
import { InfoTooltip } from "@/components/shared/info-tooltip";

const statConfig = [
  {
    key: "total" as const,
    label: "Total Inspections",
    icon: FileText,
    color: "text-foreground",
    bgColor: "bg-primary/10",
  },
  {
    key: "pendingReview" as const,
    label: "Pending Review",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    key: "supplierCorrectionsPending" as const,
    label: "Corrections Pending",
    icon: Send,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    key: "rejectedThisMonth" as const,
    label: "Rejected This Month",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    key: "avgReviewTimeMinutes" as const,
    label: "Avg Review Time",
    icon: Timer,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    suffix: " min",
  },
];

export function StatsCards() {
  const { data: stats, isLoading } = useStats();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Pilot metrics
        </h3>
        <InfoTooltip content="Illustrative figures from the pilot sample dataset — not live production metrics." />
      </div>
      <div className="grid grid-cols-5 gap-4">
        {statConfig.map((stat) => (
          <Card key={stat.key} className="border border-border shadow-none">
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-md ${stat.bgColor}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {isLoading || !stats ? (
                    <span className="inline-block h-7 w-8 animate-pulse rounded bg-muted align-middle" />
                  ) : (
                    <>
                      {stats[stat.key]}
                      {"suffix" in stat ? stat.suffix : ""}
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
