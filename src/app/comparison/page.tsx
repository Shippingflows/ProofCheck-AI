"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingState } from "@/components/shared/state-views";
import { DEMO_INSPECTION_ID } from "@/data/seed";

export default function ComparisonIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/comparison/${DEMO_INSPECTION_ID}`);
  }, [router]);

  return (
    <AppShell>
      <div className="flex h-full items-center justify-center">
        <LoadingState label="Opening comparison workspace…" />
      </div>
    </AppShell>
  );
}
