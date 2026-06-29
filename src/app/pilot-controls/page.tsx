import { AppShell } from "@/components/layout/app-shell";
import { PilotControlsContent } from "@/components/pilot/pilot-controls-content";

export default function PilotControlsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6 p-8">
        <PilotControlsContent />
      </div>
    </AppShell>
  );
}
