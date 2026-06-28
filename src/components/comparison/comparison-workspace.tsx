"use client";

import { useState, useRef, useCallback } from "react";
import { ShieldAlert } from "lucide-react";
import { DocumentPanel, type FindingMarker } from "./document-panel";
import { ViewerControls } from "./viewer-controls";
import { FindingsSidebar, type ReviewAction } from "./findings-sidebar";
import { useInspection, useFindings } from "@/hooks/use-inspections";
import { EvidenceRegion } from "@/domain/models";
import {
  ProcessingState,
  ErrorState,
} from "@/components/shared/state-views";
import { DemoBadge } from "@/components/shared/demo-badge";
import { isDemoInspection, getDemoDocuments } from "@/lib/demo";

interface ComparisonWorkspaceProps {
  inspectionId: string;
}

export function ComparisonWorkspace({ inspectionId }: ComparisonWorkspaceProps) {
  const {
    data: inspection,
    isLoading: loadingInspection,
    isError: inspectionError,
  } = useInspection(inspectionId);
  const {
    data: findings = [],
    isLoading: loadingFindings,
    isError: findingsError,
  } = useFindings(inspectionId);

  const [zoom, setZoom] = useState(100);
  const [syncScroll, setSyncScroll] = useState(true);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [reviewerActions, setReviewerActions] = useState<
    Record<string, ReviewAction>
  >({});
  const [noteDialogFindingId, setNoteDialogFindingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const masterScrollRef = useRef<HTMLDivElement | null>(null);
  const supplierScrollRef = useRef<HTMLDivElement | null>(null);
  const isScrolling = useRef(false);

  const handleMasterScroll = useCallback(
    (scrollTop: number, scrollLeft: number) => {
      if (!syncScroll || isScrolling.current) return;
      isScrolling.current = true;
      if (supplierScrollRef.current) {
        supplierScrollRef.current.scrollTop = scrollTop;
        supplierScrollRef.current.scrollLeft = scrollLeft;
      }
      requestAnimationFrame(() => {
        isScrolling.current = false;
      });
    },
    [syncScroll]
  );

  const handleSupplierScroll = useCallback(
    (scrollTop: number, scrollLeft: number) => {
      if (!syncScroll || isScrolling.current) return;
      isScrolling.current = true;
      if (masterScrollRef.current) {
        masterScrollRef.current.scrollTop = scrollTop;
        masterScrollRef.current.scrollLeft = scrollLeft;
      }
      requestAnimationFrame(() => {
        isScrolling.current = false;
      });
    },
    [syncScroll]
  );

  const handleAction = useCallback(
    (findingId: string, action: ReviewAction) => {
      setReviewerActions((prev) => ({ ...prev, [findingId]: action }));
    },
    []
  );

  const handleAddNote = useCallback((findingId: string) => {
    setNoteDialogFindingId(findingId);
    setNoteText("");
  }, []);

  const selectedFinding = findings.find((f) => f.id === selectedFindingId);
  const highlightRegion: EvidenceRegion | null =
    selectedFinding?.evidenceRegion ?? null;

  const demoDocuments = getDemoDocuments(inspectionId);
  const markers: FindingMarker[] = findings
    .filter((f) => f.evidenceRegion !== null)
    .map((f) => ({
      id: f.id,
      region: f.evidenceRegion as EvidenceRegion,
      severity: f.severity,
    }));

  if (loadingInspection || loadingFindings) {
    return (
      <div className="flex h-full items-center justify-center">
        <ProcessingState
          title="Preparing comparison"
          description="Loading documents and aligning detected differences. No file is approved automatically."
          steps={[
            "Loading approved master and supplier proof",
            "Aligning pages and detected regions",
            "Compiling findings for human review",
          ]}
        />
      </div>
    );
  }

  if (inspectionError || findingsError) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <ErrorState description="We couldn't load this comparison. Please try again." />
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <ErrorState
          title="Inspection not found"
          description="This inspection may have been reset or does not exist."
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* AI-assisted label */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">
            AI-assisted review. Human confirmation required.
          </span>
          {isDemoInspection(inspectionId) && <DemoBadge />}
        </div>
        <div className="flex items-center gap-4">
          <ViewerControls
            zoom={zoom}
            onZoomIn={() => setZoom((z) => Math.min(200, z + 25))}
            onZoomOut={() => setZoom((z) => Math.max(50, z - 25))}
            syncScroll={syncScroll}
            onToggleSyncScroll={() => setSyncScroll(!syncScroll)}
            overlayVisible={overlayVisible}
            onToggleOverlay={() => setOverlayVisible(!overlayVisible)}
            currentPage={currentPage}
            totalPages={demoDocuments ? 1 : 4}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Document panels */}
        <div className="flex flex-1 gap-3 p-3">
          <DocumentPanel
            title="Approved Master"
            label="master"
            zoom={zoom}
            overlayVisible={overlayVisible}
            highlightRegion={highlightRegion}
            documentSrc={demoDocuments?.master ?? null}
            markers={markers}
            selectedMarkerId={selectedFindingId}
            onScroll={handleMasterScroll}
            scrollRef={masterScrollRef}
          />
          <DocumentPanel
            title="Supplier Proof"
            label="supplier"
            zoom={zoom}
            overlayVisible={overlayVisible}
            highlightRegion={highlightRegion}
            documentSrc={demoDocuments?.supplier ?? null}
            markers={markers}
            selectedMarkerId={selectedFindingId}
            onScroll={handleSupplierScroll}
            scrollRef={supplierScrollRef}
          />
        </div>

        {/* Findings sidebar */}
        <FindingsSidebar
          findings={findings}
          selectedFindingId={selectedFindingId}
          onSelectFinding={setSelectedFindingId}
          reviewerActions={reviewerActions}
          onAction={handleAction}
          onAddNote={handleAddNote}
        />
      </div>

      {/* Note dialog */}
      {noteDialogFindingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-lg">
            <h4 className="text-sm font-semibold text-foreground">
              Add Reviewer Note
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Finding:{" "}
              {findings.find((f) => f.id === noteDialogFindingId)?.title}
            </p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter your note..."
              className="mt-3 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={4}
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setNoteDialogFindingId(null)}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => setNoteDialogFindingId(null)}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
