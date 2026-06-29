import { AppShell } from "@/components/layout/app-shell";
import { CorrectionRequestWrapper } from "@/components/correction/correction-request-content";
import { DEMO_INSPECTION_ID } from "@/data/seed";

export default function CorrectionPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Supplier Correction Request
          </h2>
          <p className="text-sm text-muted-foreground">
            Draft and send a correction request to the supplier.
          </p>
        </div>

        <CorrectionRequestWrapper inspectionId={DEMO_INSPECTION_ID} />
      </div>
    </AppShell>
  );
}
