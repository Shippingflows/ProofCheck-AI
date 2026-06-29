"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetDemoButton } from "@/components/shared/reset-demo-button";
import { IS_DEMO_MODE } from "@/lib/demo";
import { AlertTriangle } from "lucide-react";

export function PilotControlsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Pilot Controls</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administrative tools for the pilot workspace. Not visible in standard
          reviewer navigation.
        </p>
      </div>

      <Card className="border border-amber-200 bg-amber-50/30 shadow-none">
        <CardContent className="flex gap-3 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Pilot readiness</p>
            <p className="mt-1 text-muted-foreground">
              This workspace uses seeded sample data for demonstration. Automated
              checks assist detection only — all approval decisions require a
              qualified human reviewer. Production deployment would connect to
              your document management system, identity provider, and audit
              retention policies.
            </p>
          </div>
        </CardContent>
      </Card>

      {IS_DEMO_MODE && (
        <Card className="border border-border shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Demo Data</CardTitle>
            <p className="text-xs text-muted-foreground">
              Reset all inspections, findings, and audit events to the original
              pilot sample state.
            </p>
          </CardHeader>
          <CardContent>
            <ResetDemoButton />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
