"use client";

import { useState, useCallback, useEffect } from "react";
import { CockpitRecordHeader } from "@/components/cockpit/cockpit-record-header";
import { CockpitInspectionContext } from "@/components/cockpit/cockpit-inspection-context";
import { CockpitDocumentViewer } from "@/components/cockpit/cockpit-document-viewer";
import { CockpitFindingsRegister } from "@/components/cockpit/cockpit-findings-register";
import { CockpitReleaseBlockedBanner } from "@/components/cockpit/cockpit-release-blocked-banner";
import { CockpitFindingActionPanel } from "@/components/cockpit/cockpit-finding-action-panel";
import { CockpitFooter } from "@/components/cockpit/cockpit-footer";
import type { ReviewAction } from "@/components/comparison/findings-sidebar";
import type { FindingMarker } from "@/components/comparison/document-panel";
import { useInspection, useFindings } from "@/hooks/use-inspections";
import {
  ProcessingState,
  ErrorState,
} from "@/components/shared/state-views";
import { getDemoDocuments } from "@/lib/demo";

const COCKPIT_DEFAULT_FINDING_ID = "find_007";

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

  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(
    COCKPIT_DEFAULT_FINDING_ID
  );
  const [reviewerActions, setReviewerActions] = useState<
    Record<string, ReviewAction>
  >({});
  const [noteDialogFindingId, setNoteDialogFindingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [overlayVisible] = useState(true);

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

  useEffect(() => {
    if (findings.length === 0) return;
    const defaultFinding = findings.find((f) => f.id === COCKPIT_DEFAULT_FINDING_ID);
    if (defaultFinding && !findings.some((f) => f.id === selectedFindingId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedFindingId(COCKPIT_DEFAULT_FINDING_ID);
    }
  }, [findings, selectedFindingId]);

  const selectedFinding = findings.find((f) => f.id === selectedFindingId) ?? null;
  const demoDocuments = getDemoDocuments(inspectionId);
  const findingNumberMap = new Map(findings.map((f, i) => [f.id, i + 1]));
  const selectedFindingLabel = selectedFindingId
    ? `F-${String(findingNumberMap.get(selectedFindingId) ?? 0).padStart(3, "0")}`
    : null;
  const markers: FindingMarker[] = findings
    .filter((f) => f.evidenceRegion !== null)
    .map((f) => ({
      id: f.id,
      region: f.evidenceRegion!,
      severity: f.severity,
      number: findingNumberMap.get(f.id) ?? 0,
    }));

  if (loadingInspection || loadingFindings) {
    return (
      <div className="flex h-full items-center justify-center">
        <ProcessingState
          title="Preparing comparison cockpit"
          description="Loading governed documents and aligning detected differences."
          steps={[
            "Loading approved master and supplier proof",
            "Aligning pages and detected regions",
            "Compiling findings register for human review",
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
    <div className="min-h-0 flex-1 overflow-auto p-4">
      <CockpitRecordHeader inspection={inspection} />

      <CockpitReleaseBlockedBanner findings={findings} />

      <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-[330px_minmax(0,1fr)_390px]">
        <CockpitInspectionContext inspection={inspection} />

        <CockpitDocumentViewer
          selectedFindingId={selectedFindingId}
          selectedFinding={selectedFinding}
          findingNumberMap={findingNumberMap}
          markers={markers}
          masterSrc={demoDocuments?.master ?? null}
          supplierSrc={demoDocuments?.supplier ?? null}
          overlayVisible={overlayVisible}
          onSelectFinding={setSelectedFindingId}
        />

        <CockpitFindingsRegister
          findings={findings}
          selectedFindingId={selectedFindingId}
          findingNumberMap={findingNumberMap}
          onSelectFinding={setSelectedFindingId}
        />
      </div>

      <CockpitFindingActionPanel
        finding={selectedFinding}
        findingLabel={selectedFindingLabel}
        reviewerAction={
          selectedFindingId ? reviewerActions[selectedFindingId] ?? null : null
        }
        onAction={(action) => {
          if (selectedFindingId) handleAction(selectedFindingId, action);
        }}
        onAddNote={() => {
          if (selectedFindingId) handleAddNote(selectedFindingId);
        }}
      />

      <CockpitFooter findings={findings} />

      {noteDialogFindingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md border border-border bg-card p-6 shadow-[var(--shadow-cockpit)]">
            <h4 className="text-sm font-extrabold text-foreground">Add reviewer note</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Finding: {findings.find((f) => f.id === noteDialogFindingId)?.title}
            </p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add reviewer observations, conditions, or correction rationale..."
              className="mt-3 w-full rounded border border-input bg-transparent px-3 py-2 text-[12.5px] leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={4}
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setNoteDialogFindingId(null)}
                className="cockpit-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => setNoteDialogFindingId(null)}
                className="cockpit-btn cockpit-btn-primary"
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
