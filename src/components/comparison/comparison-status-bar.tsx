"use client";

import { Finding } from "@/domain/models";
import { FindingSeverity } from "@/domain/enums";
import { AlertTriangle } from "lucide-react";
import { ViewerControls } from "./viewer-controls";
import { cn } from "@/lib/utils";

interface ComparisonStatusBarProps {
  findings: Finding[];
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  syncScroll: boolean;
  onToggleSyncScroll: () => void;
  overlayVisible: boolean;
  onToggleOverlay: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ComparisonStatusBar({
  findings,
  zoom,
  onZoomIn,
  onZoomOut,
  syncScroll,
  onToggleSyncScroll,
  overlayVisible,
  onToggleOverlay,
  currentPage,
  totalPages,
  onPageChange,
}: ComparisonStatusBarProps) {
  const counts = {
    critical: findings.filter((f) => f.severity === FindingSeverity.Critical).length,
    major: findings.filter((f) => f.severity === FindingSeverity.Major).length,
    minor: findings.filter((f) => f.severity === FindingSeverity.Minor).length,
  };

  return (
    <div className="flex h-[42px] shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex min-w-0 items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#c2410c]" strokeWidth={2} />
        <span className="hidden text-[11.5px] font-medium text-muted-foreground sm:inline">
          AI-assisted detection
        </span>
        <span className="hidden text-[11px] text-[#d0ccc7] sm:inline">·</span>
        <span className="truncate text-[11.5px] text-muted-foreground">
          Human QA confirmation required before any disposition
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-1 sm:flex">
          {counts.critical > 0 && (
            <span className="rounded-[3px] border border-[#fecaca] bg-[#fee2e2] px-1.5 py-0.5 text-[11px] font-bold text-[#991b1b]">
              {counts.critical} Critical
            </span>
          )}
          {counts.major > 0 && (
            <span className="rounded-[3px] border border-[#fed7aa] bg-[#ffedd5] px-1.5 py-0.5 text-[11px] font-bold text-[#9a3412]">
              {counts.major} Major
            </span>
          )}
          {counts.minor > 0 && (
            <span className="rounded-[3px] border border-[#cbd5e1] bg-[#f1f5f9] px-1.5 py-0.5 text-[11px] font-semibold text-[#334155]">
              {counts.minor} Minor
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 rounded-[3px] border border-[#fecaca] bg-[#fef2f2] px-2.5 py-0.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#dc2626]" />
          <span className="text-[11px] font-bold text-[#b91c1c]">Action Required</span>
        </div>

        <div className="hidden border-l border-border pl-2.5 sm:block">
          <ViewerControls
            compact
            zoom={zoom}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            syncScroll={syncScroll}
            onToggleSyncScroll={onToggleSyncScroll}
            overlayVisible={overlayVisible}
            onToggleOverlay={onToggleOverlay}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </div>
  );
}
