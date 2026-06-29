"use client";

import { use } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ComparisonWorkspace } from "@/components/comparison/comparison-workspace";

export default function ComparisonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AppShell>
      <div className="-m-7 flex min-h-[calc(100vh-58px)] flex-col sm:-mx-8">
        <ComparisonWorkspace inspectionId={id} />
      </div>
    </AppShell>
  );
}
