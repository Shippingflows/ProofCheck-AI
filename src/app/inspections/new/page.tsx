"use client";

import { AppShell } from "@/components/layout/app-shell";
import { NewInspectionForm } from "@/components/inspections/new-inspection-form";

export default function NewInspectionPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            New Supplier Proof Review
          </h2>
          <p className="text-sm text-muted-foreground">
            Capture procurement intake details and configure a governed supplier
            proof comparison.
          </p>
        </div>

        <NewInspectionForm />
      </div>
    </AppShell>
  );
}
