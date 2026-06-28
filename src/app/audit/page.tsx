"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AuditPageContent } from "@/components/audit/audit-page-content";
import { DEMO_INSPECTION_ID } from "@/data/seed";

export default function AuditPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <AuditPageContent inspectionId={DEMO_INSPECTION_ID} />
      </div>
    </AppShell>
  );
}
