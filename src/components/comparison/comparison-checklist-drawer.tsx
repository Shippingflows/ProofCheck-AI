"use client";

import { useCallback, useState } from "react";
import { CheckSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { ReviewerChecklistPanel } from "@/components/shared/reviewer-checklist-panel";
import { REVIEWER_CHECKLIST_ITEMS } from "@/lib/reviewer-checklist";
import { cn } from "@/lib/utils";

interface ComparisonChecklistDrawerProps {
  inspectionId: string;
  completed: Record<string, boolean>;
}

export function ComparisonChecklistDrawer({
  inspectionId,
  completed,
}: ComparisonChecklistDrawerProps) {
  const [open, setOpen] = useState(false);
  const doneCount = REVIEWER_CHECKLIST_ITEMS.filter((i) => completed[i.id]).length;

  const toggle = useCallback(() => setOpen((v) => !v), []);

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "fixed bottom-6 left-[calc(15rem+1rem)] z-30 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium shadow-md transition-colors hover:bg-muted",
          open && "bg-primary/10 text-primary"
        )}
        aria-expanded={open}
        aria-label="Toggle reviewer checklist"
      >
        <CheckSquare className="h-3.5 w-3.5" />
        Checklist {doneCount}/{REVIEWER_CHECKLIST_ITEMS.length}
        {open ? (
          <ChevronLeft className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </button>

      <div
        className={cn(
          "fixed bottom-0 left-60 z-20 w-80 border-r border-t border-border bg-card shadow-xl transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ top: "3.5rem" }}
      >
        <div className="flex h-full flex-col overflow-hidden p-3">
          <ReviewerChecklistPanel
            inspectionId={inspectionId}
            completed={completed}
            compact
          />
        </div>
      </div>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-10 bg-black/20"
          onClick={() => setOpen(false)}
          aria-label="Close checklist"
        />
      )}
    </>
  );
}
