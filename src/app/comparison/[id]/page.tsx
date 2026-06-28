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
      <div className="-m-6 flex h-[calc(100vh-3.5rem)] flex-col">
        <ComparisonWorkspace inspectionId={id} />
      </div>
    </AppShell>
  );
}
