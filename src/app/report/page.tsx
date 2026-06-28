"use client";

import { AppShell } from "@/components/layout/app-shell";
import { FindingsReportContent } from "@/components/report/findings-report-content";
import { DEMO_INSPECTION_ID } from "@/data/seed";
import { DemoBadge } from "@/components/shared/demo-badge";
import { isDemoInspection } from "@/lib/demo";

export default function ReportPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              Findings Report
            </h2>
            {isDemoInspection(DEMO_INSPECTION_ID) && <DemoBadge />}
          </div>
          <p className="text-sm text-muted-foreground">
            QC inspection findings and evidence summary.
          </p>
        </div>

        <FindingsReportContent inspectionId={DEMO_INSPECTION_ID} />
      </div>
    </AppShell>
  );
}
