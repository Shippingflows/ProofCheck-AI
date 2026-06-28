"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useStats } from "@/hooks/use-inspections";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { InfoTooltip } from "@/components/shared/info-tooltip";
import { IS_DEMO_MODE } from "@/lib/demo";

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
    key: "approved" as const,
    label: "Approved",
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    key: "rejected" as const,
    label: "Rejected",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
];

export function StatsCards() {
  const { data: stats, isLoading } = useStats();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {IS_DEMO_MODE ? "Demo metrics" : "Metrics"}
        </h3>
        <InfoTooltip
          content={
            IS_DEMO_MODE
              ? "These are illustrative figures based on seeded sample data, not live production metrics."
              : "Estimated figures based on recorded inspections."
          }
        />
      </div>
      <div className="grid grid-cols-4 gap-4">
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
                    stats[stat.key]
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
