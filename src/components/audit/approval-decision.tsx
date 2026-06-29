"use client";

import { useState, useCallback } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  User,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInspection, useFindings } from "@/hooks/use-inspections";
import { addAuditEvent, updateInspection } from "@/data/mock-repository";
import {
  AuditAction,
  InspectionStatus,
  ReviewDecision,
  AuditActorRole,
  AuditEventSource,
} from "@/domain/enums";
import { cn } from "@/lib/utils";

type DecisionOption = "approve" | "approve_with_notes" | "reject";

const DECISION_OPTIONS: {
  id: DecisionOption;
  label: string;
  description: string;
  icon: typeof CheckCircle;
  activeClass: string;
  requiresNotes: boolean;
}[] = [
  {
    id: "approve",
    label: "Approve",
    description: "Proof meets all requirements",
    icon: CheckCircle,
    activeClass: "border-emerald-500 bg-emerald-50 text-emerald-700",
    requiresNotes: false,
  },
  {
    id: "approve_with_notes",
    label: "Approve With Notes",
    description: "Acceptable with observations noted",
    icon: AlertTriangle,
    activeClass: "border-amber-500 bg-amber-50 text-amber-700",
    requiresNotes: true,
  },
  {
    id: "reject",
    label: "Reject / Request Correction",
    description: "Supplier must resubmit",
    icon: XCircle,
    activeClass: "border-red-500 bg-red-50 text-red-700",
    requiresNotes: true,
  },
];

interface ApprovalDecisionProps {
  inspectionId: string;
}

export function ApprovalDecision({ inspectionId }: ApprovalDecisionProps) {
  const { data: inspection } = useInspection(inspectionId);
  const { data: findings = [] } = useFindings(inspectionId);

  const [decision, setDecision] = useState<DecisionOption | null>(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showAttestation, setShowAttestation] = useState(false);

  const reviewerName = inspection?.reviewerName ?? "Sarah Chen";
  const reviewerEmail = inspection?.reviewerEmail ?? "sarah.chen@demo-company.com";
  const reviewerRole = inspection?.reviewerRole ?? "Quality Reviewer";

  const selectedOption = DECISION_OPTIONS.find((o) => o.id === decision);
  const notesRequired = selectedOption?.requiresNotes ?? false;

  const validate = useCallback(() => {
    if (!decision) {
      setError("Please select a decision.");
      return false;
    }
    if (notesRequired && !notes.trim()) {
      setError("Notes are required for this decision.");
      return false;
    }
    setError("");
    return true;
  }, [decision, notes, notesRequired]);

  const handleRequestConfirm = useCallback(() => {
    if (!validate()) return;
    setShowAttestation(true);
  }, [validate]);

  const handleConfirmAttestation = useCallback(async () => {
    if (!decision) return;
    setShowAttestation(false);
    setIsSaving(true);

    const statusMap: Record<DecisionOption, InspectionStatus> = {
      approve: InspectionStatus.Approved,
      approve_with_notes: InspectionStatus.ApprovedWithNotes,
      reject: InspectionStatus.Rejected,
    };

    const decisionMap: Record<DecisionOption, ReviewDecision> = {
      approve: ReviewDecision.Approved,
      approve_with_notes: ReviewDecision.Approved,
      reject: ReviewDecision.CorrectionRequired,
    };

    await updateInspection(inspectionId, {
      status: statusMap[decision],
      decision: decisionMap[decision],
      reviewerName,
      recommendationNote: notes.trim() || null,
    });

    await addAuditEvent({
      inspectionId,
      action: AuditAction.DecisionMade,
      actor: reviewerName,
      actorRole: AuditActorRole.QualityReviewer,
      source: AuditEventSource.Reviewer,
      metadata: {
        decision,
        notes: notes.trim() || "(none)",
        findingsTotal: String(findings.length),
        reviewerEmail,
        attestation: "confirmed",
      },
    });

    setIsSaving(false);
    setSaved(true);
  }, [decision, notes, inspectionId, findings.length, reviewerName, reviewerEmail]);

  if (saved) {
    const opt = DECISION_OPTIONS.find((o) => o.id === decision);
    return (
      <Card className="border-2 border-emerald-200 shadow-none">
        <CardContent className="flex flex-col items-center gap-3 py-10">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
          <p className="text-lg font-semibold text-foreground">
            Decision Recorded
          </p>
          <p className="text-sm text-muted-foreground">
            {opt?.label} — by {reviewerName}
          </p>
          {notes && (
            <p className="max-w-md text-center text-xs text-muted-foreground italic">
              &ldquo;{notes}&rdquo;
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Record Decision</CardTitle>
          <p className="text-xs text-muted-foreground">
            This decision is made by the reviewer. ProofCheck AI assists detection
            and never approves or rejects a proof automatically.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Decision</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {DECISION_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = decision === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setDecision(opt.id);
                      setError("");
                    }}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-md border-2 px-4 py-3 text-left transition-all",
                      isActive
                        ? opt.activeClass
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isActive ? "" : "text-muted-foreground"
                      )}
                    />
                    <div>
                      <p
                        className={cn(
                          "text-sm font-medium",
                          !isActive && "text-foreground"
                        )}
                      >
                        {opt.label}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          isActive ? "opacity-80" : "text-muted-foreground"
                        )}
                      >
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Reviewer</Label>
            <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{reviewerName}</p>
                <p className="text-xs text-muted-foreground">
                  {reviewerRole} · {reviewerEmail}
                </p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Reviewer identity is locked to the signed-in pilot account.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">
              Notes{" "}
              {notesRequired ? (
                <span className="font-normal text-destructive">(required)</span>
              ) : (
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              )}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setError("");
              }}
              placeholder="Add reviewer observations, conditions, or correction rationale..."
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end pt-2">
            <Button onClick={handleRequestConfirm} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? "Saving..." : "Confirm Decision"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showAttestation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">
                Attestation Required
              </h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              I, <span className="font-medium text-foreground">{reviewerName}</span>,
              confirm that I have reviewed the detected findings and this decision
              reflects my professional judgment. ProofCheck AI did not make this
              decision automatically.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Decision:{" "}
              <span className="font-medium text-foreground">
                {selectedOption?.label}
              </span>
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAttestation(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmAttestation}>
                I Confirm This Decision
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
