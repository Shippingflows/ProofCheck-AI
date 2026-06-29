"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import { DocumentPanel, type FindingMarker } from "./document-panel";
import { ViewerControls } from "./viewer-controls";
import { FindingsSidebar, type ReviewAction } from "./findings-sidebar";
import { FindingDetailPanel } from "./finding-detail-panel";
import { InspectionSummaryBar } from "./inspection-summary-bar";
import { ReviewerChecklistPanel } from "@/components/shared/reviewer-checklist-panel";
import { useInspection, useFindings } from "@/hooks/use-inspections";
import { EvidenceRegion } from "@/domain/models";
import { FindingSeverity } from "@/domain/enums";
import {
  ProcessingState,
  ErrorState,
} from "@/components/shared/state-views";
import { getDemoDocuments } from "@/lib/demo";
import { DEMO_DEFAULT_FINDING_ID } from "@/data/seed";

function getHighlightLabel(finding: { id: string; severity: FindingSeverity; title: string }): string {
  const sev =
    finding.severity === FindingSeverity.Critical
      ? "Critical"
      : finding.severity === FindingSeverity.Major
        ? "Major"
        : "Minor";
  const shortTitle =
    finding.id === DEMO_DEFAULT_FINDING_ID ? "Revision mismatch" : finding.title;
  return `${sev} · ${shortTitle}`;
}

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
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(
    DEMO_DEFAULT_FINDING_ID
  );
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

  // Ensure demo opens with the revision mismatch preselected once findings load
  useEffect(() => {
    if (findings.length === 0) return;
    const defaultFinding = findings.find((f) => f.id === DEMO_DEFAULT_FINDING_ID);
    if (defaultFinding && !findings.some((f) => f.id === selectedFindingId)) {
      setSelectedFindingId(DEMO_DEFAULT_FINDING_ID);
    }
  }, [findings, selectedFindingId]);

  const selectedFinding = findings.find((f) => f.id === selectedFindingId) ?? null;
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
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">
            AI-assisted review. Human confirmation required.
          </span>
        </div>
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

      <InspectionSummaryBar inspection={inspection} />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 gap-3 p-3">
          <DocumentPanel
            title="Approved Master"
            label="master"
            zoom={zoom}
            overlayVisible={overlayVisible}
            highlightRegion={highlightRegion}
            highlightLabel={
              selectedFinding ? getHighlightLabel(selectedFinding) : null
            }
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
            highlightLabel={
              selectedFinding ? getHighlightLabel(selectedFinding) : null
            }
            documentSrc={demoDocuments?.supplier ?? null}
            markers={markers}
            selectedMarkerId={selectedFindingId}
            onScroll={handleSupplierScroll}
            scrollRef={supplierScrollRef}
          />
        </div>

        <FindingDetailPanel
          finding={selectedFinding}
          reviewerAction={selectedFindingId ? reviewerActions[selectedFindingId] ?? null : null}
          onAction={(action) => {
            if (selectedFindingId) handleAction(selectedFindingId, action);
          }}
          onAddNote={() => {
            if (selectedFindingId) handleAddNote(selectedFindingId);
          }}
        />

        <FindingsSidebar
          findings={findings}
          selectedFindingId={selectedFindingId}
          onSelectFinding={setSelectedFindingId}
          reviewerActions={reviewerActions}
          onAction={handleAction}
          onAddNote={handleAddNote}
        />
      </div>

      <div className="shrink-0 border-t border-border p-3">
        <ReviewerChecklistPanel
          inspectionId={inspectionId}
          completed={inspection.checklistCompleted}
        />
      </div>

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
