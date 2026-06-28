"use client";

import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoBadgeProps {
  className?: string;
  label?: string;
}

/**
 * Visual marker indicating that the data shown is a seeded sample, not a
 * real production inspection.
 */
export function DemoBadge({ className, label = "Demo Mode" }: DemoBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-indigo-700",
        className
      )}
    >
      <FlaskConical className="h-3 w-3" />
      {label}
    </span>
  );
}
