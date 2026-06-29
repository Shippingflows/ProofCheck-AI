"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { CheckSquare, Square } from "lucide-react";
import { REVIEWER_CHECKLIST_ITEMS } from "@/lib/reviewer-checklist";
import { updateInspection } from "@/data/mock-repository";
import { cn } from "@/lib/utils";

interface ComparisonChecklistFooterProps {
  inspectionId: string;
  completed: Record<string, boolean>;
}

const FOOTER_ITEMS = REVIEWER_CHECKLIST_ITEMS.filter((item) =>
  ["chk_text", "chk_barcode", "chk_symbols", "chk_revision", "chk_critical"].includes(
    item.id
  )
);

export function ComparisonChecklistFooter({
  inspectionId,
  completed,
}: ComparisonChecklistFooterProps) {
  const [local, setLocal] = useState(completed);
  const [saving, setSaving] = useState<string | null>(null);

  const toggle = useCallback(
    async (id: string) => {
      const next = { ...local, [id]: !local[id] };
      setLocal(next);
      setSaving(id);
      await updateInspection(inspectionId, { checklistCompleted: next });
      setSaving(null);
    },
    [inspectionId, local]
  );

  return (
    <div className="flex shrink-0 items-center gap-4 border-t border-border bg-secondary px-5 py-2.5">
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
        Reviewer Checklist
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {FOOTER_ITEMS.map((item) => {
          const checked = !!local[item.id];
          const Icon = checked ? CheckSquare : Square;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              disabled={saving === item.id}
              className="flex items-center gap-1.5 text-[11.5px] text-foreground hover:text-primary disabled:opacity-60"
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  checked ? "text-primary" : "text-muted-foreground"
                )}
              />
              {item.label.replace(" checked", "").replace(" reviewed", "").replace(" confirmed", "")}
            </button>
          );
        })}
      </div>
      <Link
        href="/report"
        className="shrink-0 rounded-[3px] bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
      >
        View Findings Report →
      </Link>
    </div>
  );
}
