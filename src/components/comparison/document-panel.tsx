"use client";

import { EvidenceRegion } from "@/domain/models";
import { FindingSeverity } from "@/domain/enums";
import { cn } from "@/lib/utils";

export interface FindingMarker {
  id: string;
  region: EvidenceRegion;
  severity: FindingSeverity;
}

interface DocumentPanelProps {
  title: string;
  label: "master" | "supplier";
  zoom: number;
  overlayVisible: boolean;
  highlightRegion: EvidenceRegion | null;
  documentSrc?: string | null;
  markers?: FindingMarker[];
  selectedMarkerId?: string | null;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

const PAGE_WIDTH = 500;
const PAGE_HEIGHT = 700;

const markerColor: Record<FindingSeverity, string> = {
  [FindingSeverity.Critical]: "border-red-400/70 bg-red-400/10",
  [FindingSeverity.Major]: "border-amber-400/70 bg-amber-400/10",
  [FindingSeverity.Minor]: "border-slate-400/60 bg-slate-400/10",
};

export function DocumentPanel({
  title,
  label,
  zoom,
  overlayVisible,
  highlightRegion,
  documentSrc,
  markers = [],
  selectedMarkerId,
  onScroll,
  scrollRef,
}: DocumentPanelProps) {
  const scale = zoom / 100;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (onScroll) {
      const target = e.currentTarget;
      onScroll(target.scrollTop, target.scrollLeft);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-md border border-border bg-card">
      <div className="flex h-9 items-center justify-between border-b border-border px-3">
        <span className="text-xs font-medium text-foreground">{title}</span>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            label === "master"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-blue-50 text-blue-700"
          )}
        >
          {label === "master" ? "Approved" : "Supplier"}
        </span>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-auto bg-slate-100 p-4"
      >
        <div
          className="relative mx-auto bg-white shadow-sm transition-transform"
          style={{
            width: `${PAGE_WIDTH * scale}px`,
            height: `${PAGE_HEIGHT * scale}px`,
          }}
        >
          {documentSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={documentSrc}
              alt={`${title} document preview`}
              width={PAGE_WIDTH}
              height={PAGE_HEIGHT}
              draggable={false}
              className="absolute inset-0 h-full w-full select-none"
            />
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: `${PAGE_WIDTH}px`,
                height: `${PAGE_HEIGHT}px`,
              }}
            >
              <div className="w-full space-y-3">
                <div className="h-8 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-5/6 rounded bg-slate-100" />
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="mt-4 h-6 w-1/2 rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-4/5 rounded bg-slate-100" />
                <div className="mt-4 h-16 w-2/3 rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-3/4 rounded bg-slate-100" />
                <div className="mt-4 h-10 w-1/3 rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-5/6 rounded bg-slate-100" />
              </div>
            </div>
          )}

          {/* Faint markers for all findings (shown when no finding is selected) */}
          {overlayVisible &&
            !highlightRegion &&
            markers.map((marker) => (
              <div
                key={marker.id}
                className={cn(
                  "pointer-events-none absolute rounded-sm border",
                  markerColor[marker.severity],
                  selectedMarkerId === marker.id && "ring-1 ring-offset-0"
                )}
                style={{
                  left: `${marker.region.x * scale}px`,
                  top: `${marker.region.y * scale}px`,
                  width: `${marker.region.width * scale}px`,
                  height: `${marker.region.height * scale}px`,
                }}
              />
            ))}

          {/* Strong highlight for the selected finding */}
          {highlightRegion && overlayVisible && (
            <div
              className={cn(
                "pointer-events-none absolute rounded-sm border-2 shadow-[0_0_0_4px_rgba(0,0,0,0.04)] transition-all duration-200",
                label === "supplier"
                  ? "border-red-500 bg-red-500/10"
                  : "border-amber-500 bg-amber-500/10"
              )}
              style={{
                left: `${highlightRegion.x * scale}px`,
                top: `${highlightRegion.y * scale}px`,
                width: `${highlightRegion.width * scale}px`,
                height: `${highlightRegion.height * scale}px`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
