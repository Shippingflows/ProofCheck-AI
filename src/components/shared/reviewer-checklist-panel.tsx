"use client";

import { useCallback, useState } from "react";
import { CheckSquare, Square } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REVIEWER_CHECKLIST_ITEMS } from "@/lib/reviewer-checklist";
import { updateInspection } from "@/data/mock-repository";
import { cn } from "@/lib/utils";

interface ReviewerChecklistPanelProps {
  inspectionId: string;
  completed: Record<string, boolean>;
  onUpdate?: (completed: Record<string, boolean>) => void;
}

export function ReviewerChecklistPanel({
  inspectionId,
  completed,
  onUpdate,
}: ReviewerChecklistPanelProps) {
  const [local, setLocal] = useState(completed);
  const [saving, setSaving] = useState<string | null>(null);

  const toggle = useCallback(
    async (id: string) => {
      const next = { ...local, [id]: !local[id] };
      setLocal(next);
      setSaving(id);
      await updateInspection(inspectionId, { checklistCompleted: next });
      onUpdate?.(next);
      setSaving(null);
    },
    [inspectionId, local, onUpdate]
  );

  const doneCount = REVIEWER_CHECKLIST_ITEMS.filter((i) => local[i.id]).length;

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            Reviewer Checklist
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {doneCount}/{REVIEWER_CHECKLIST_ITEMS.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Confirm each step before recording a final decision.
        </p>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {REVIEWER_CHECKLIST_ITEMS.map((item) => {
          const checked = !!local[item.id];
          const Icon = checked ? CheckSquare : Square;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              disabled={saving === item.id}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted/60",
                checked && "text-foreground",
                !checked && "text-muted-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  checked ? "text-emerald-600" : "text-muted-foreground"
                )}
              />
              {item.label}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
