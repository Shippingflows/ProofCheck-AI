"use client";

import {
  ZoomIn,
  ZoomOut,
  Link2,
  Link2Off,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewerControlsProps {
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
  compact?: boolean;
}

export function ViewerControls({
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
  compact = false,
}: ViewerControlsProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleOverlay}
          className={cn(
            "rounded-[3px] border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent",
            overlayVisible && "border-primary/30 bg-primary/5 text-primary"
          )}
        >
          Overlay
        </button>
        <button
          type="button"
          onClick={() => onZoomIn()}
          className="rounded-[3px] border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent"
        >
          Fit
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-1.5 py-1 shadow-sm">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onZoomOut}
        disabled={zoom <= 50}
        title="Zoom out"
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </Button>
      <span className="min-w-[3rem] text-center text-xs font-medium text-muted-foreground">
        {zoom}%
      </span>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onZoomIn}
        disabled={zoom >= 200}
        title="Zoom in"
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </Button>

      <div className="mx-1 h-4 w-px bg-border" />

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onToggleSyncScroll}
        title={syncScroll ? "Disable synced scrolling" : "Enable synced scrolling"}
        className={cn(syncScroll && "bg-primary/10 text-primary")}
      >
        {syncScroll ? (
          <Link2 className="h-3.5 w-3.5" />
        ) : (
          <Link2Off className="h-3.5 w-3.5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onToggleOverlay}
        title={overlayVisible ? "Hide difference overlay" : "Show difference overlay"}
        className={cn(overlayVisible && "bg-primary/10 text-primary")}
      >
        <Layers className="h-3.5 w-3.5" />
      </Button>

      <div className="mx-1 h-4 w-px bg-border" />

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>
      <span className="min-w-[3.5rem] text-center text-xs font-medium text-muted-foreground">
        {currentPage} / {totalPages}
      </span>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
