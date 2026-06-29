"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentInspections } from "@/components/dashboard/recent-inspections";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AppShell } from "@/components/layout/app-shell";
import { OnboardingPanel } from "@/components/shared/onboarding-panel";
import { WhatProofCheckReviews } from "@/components/shared/what-proofcheck-reviews";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1100px] space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
          <p className="text-[13px] text-muted-foreground">
            Overview of supplier proof inspections and review activity.
          </p>
        </div>

        <OnboardingPanel />

        <StatsCards />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RecentInspections />
          </div>
          <div className="space-y-4">
            <WhatProofCheckReviews />
            <ActivityFeed />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
