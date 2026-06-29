"use client";

import { CorrectionStatus } from "@/domain/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CORRECTION_STATUS_STEPS,
  correctionStatusLabel,
} from "@/lib/correction-status";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CorrectionStatusTrackerProps {
  status: CorrectionStatus;
}

export function CorrectionStatusTracker({ status }: CorrectionStatusTrackerProps) {
  const currentIdx = CORRECTION_STATUS_STEPS.indexOf(status);
  const isClosed = status === CorrectionStatus.Closed;
  const isNotStarted = status === CorrectionStatus.NotStarted;

  if (isNotStarted) return null;

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Supplier Correction Status
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Current: {correctionStatusLabel(status)}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-1">
          {CORRECTION_STATUS_STEPS.map((step, idx) => {
            const done = currentIdx > idx || isClosed;
            const active = step === status;
            return (
              <div key={step} className="flex items-center gap-1">
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    done && "bg-emerald-50 text-emerald-700",
                    active && !done && "bg-primary/10 text-primary",
                    !done && !active && "bg-muted text-muted-foreground"
                  )}
                >
                  {done && <Check className="h-2.5 w-2.5" />}
                  {correctionStatusLabel(step)}
                </div>
                {idx < CORRECTION_STATUS_STEPS.length - 1 && (
                  <span className="text-muted-foreground">→</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
