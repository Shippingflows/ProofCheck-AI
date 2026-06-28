"use client";

import { useState, useCallback } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useInspection, useFindings } from "@/hooks/use-inspections";
import { addAuditEvent, updateInspection } from "@/data/mock-repository";
import { AuditAction, InspectionStatus, ReviewDecision } from "@/domain/enums";
import { cn } from "@/lib/utils";

type DecisionOption = "approve" | "approve_with_notes" | "reject";

const DECISION_OPTIONS: {
  id: DecisionOption;
  label: string;
  description: string;
  icon: typeof CheckCircle;
  activeClass: string;
}[] = [
  {
    id: "approve",
    label: "Approve",
    description: "Proof meets all requirements",
    icon: CheckCircle,
    activeClass: "border-emerald-500 bg-emerald-50 text-emerald-700",
  },
  {
    id: "approve_with_notes",
    label: "Approve With Notes",
    description: "Acceptable with observations noted",
    icon: AlertTriangle,
    activeClass: "border-amber-500 bg-amber-50 text-amber-700",
  },
  {
    id: "reject",
    label: "Reject / Request Correction",
    description: "Supplier must resubmit",
    icon: XCircle,
    activeClass: "border-red-500 bg-red-50 text-red-700",
  },
];

interface ApprovalDecisionProps {
  inspectionId: string;
}

export function ApprovalDecision({ inspectionId }: ApprovalDecisionProps) {
  const { data: inspection } = useInspection(inspectionId);
  const { data: findings = [] } = useFindings(inspectionId);

  const [decision, setDecision] = useState<DecisionOption | null>(null);
  const [reviewerName, setReviewerName] = useState(
    inspection?.reviewerName ?? ""
  );
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = useCallback(async () => {
    if (!decision) {
      setError("Please select a decision.");
      return;
    }
    if (!reviewerName.trim()) {
      setError("Reviewer name is required.");
      return;
    }
    setError("");
    setIsSaving(true);

    const statusMap: Record<DecisionOption, InspectionStatus> = {
      approve: InspectionStatus.Approved,
      approve_with_notes: InspectionStatus.Approved,
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
      reviewerName: reviewerName.trim(),
    });

    await addAuditEvent({
      inspectionId,
      action: AuditAction.DecisionMade,
      actor: reviewerName.trim(),
      metadata: {
        decision,
        notes: notes.trim() || "(none)",
        findingsTotal: String(findings.length),
      },
    });

    setIsSaving(false);
    setSaved(true);
  }, [decision, reviewerName, notes, inspectionId, findings.length]);

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
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Record Decision</CardTitle>
        <p className="text-xs text-muted-foreground">
          This decision is made by the reviewer. ProofCheck AI assists detection
          and never approves or rejects a proof automatically.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Decision options */}
        <div className="space-y-2">
          <Label>Decision</Label>
          <div className="grid grid-cols-3 gap-3">
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

        {/* Reviewer name */}
        <div className="space-y-1.5">
          <Label htmlFor="reviewerName">Reviewer Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reviewerName"
              value={reviewerName}
              onChange={(e) => {
                setReviewerName(e.target.value);
                setError("");
              }}
              placeholder="Enter your name"
              className="pl-9"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">
            Notes{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any reviewer observations or conditions..."
            rows={3}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Confirm Decision"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
