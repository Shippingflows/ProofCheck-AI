"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentInspections } from "@/components/dashboard/recent-inspections";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AppShell } from "@/components/layout/app-shell";
import { OnboardingPanel } from "@/components/shared/onboarding-panel";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Overview of supplier proof inspections and review activity.
          </p>
        </div>

        <OnboardingPanel />

        <StatsCards />

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <RecentInspections />
          </div>
          <div className="col-span-1">
            <ActivityFeed />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
