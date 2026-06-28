"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  content: string;
  className?: string;
  side?: "top" | "bottom";
}

/**
 * Lightweight, dependency-free tooltip. Shows on hover and keyboard focus
 * of an info icon. Used to explain domain concepts without cluttering the UI.
 */
export function InfoTooltip({
  content,
  className,
  side = "top",
}: InfoTooltipProps) {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      <button
        type="button"
        tabIndex={0}
        aria-label="More information"
        className="inline-flex items-center justify-center text-muted-foreground/70 transition-colors hover:text-foreground focus-visible:text-foreground focus:outline-none"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 w-56 -translate-x-1/2 rounded-md border border-border bg-popover px-3 py-2 text-left text-xs font-normal leading-relaxed text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
          side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
        )}
      >
        {content}
      </span>
    </span>
  );
}
