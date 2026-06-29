import { CorrectionStatus } from "@/domain/enums";

export const CORRECTION_STATUS_LABELS: Record<CorrectionStatus, string> = {
  [CorrectionStatus.NotStarted]: "Not started",
  [CorrectionStatus.DraftNeeded]: "Draft needed",
  [CorrectionStatus.DraftPrepared]: "Draft prepared",
  [CorrectionStatus.SentToSupplier]: "Sent to supplier",
  [CorrectionStatus.AwaitingResubmission]: "Awaiting resubmission",
  [CorrectionStatus.Resubmitted]: "Resubmitted",
  [CorrectionStatus.ReInspectionRequired]: "Re-inspection required",
  [CorrectionStatus.Closed]: "Closed",
};

export const CORRECTION_STATUS_STEPS: CorrectionStatus[] = [
  CorrectionStatus.DraftNeeded,
  CorrectionStatus.DraftPrepared,
  CorrectionStatus.SentToSupplier,
  CorrectionStatus.AwaitingResubmission,
  CorrectionStatus.Resubmitted,
  CorrectionStatus.ReInspectionRequired,
];

export function correctionStatusLabel(status: CorrectionStatus): string {
  return CORRECTION_STATUS_LABELS[status] ?? status;
}
