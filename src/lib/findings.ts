import { Finding } from "@/domain/models";
import { FindingCategory, FindingSeverity } from "@/domain/enums";

/** Findings at or above this confidence are treated as high-confidence. */
export const POTENTIAL_MISMATCH_THRESHOLD = 0.9;

export function isPotentialMismatch(finding: Finding): boolean {
  return finding.confidence < POTENTIAL_MISMATCH_THRESHOLD;
}

export function confidencePercent(finding: Finding): number {
  return Math.round(finding.confidence * 100);
}

/**
 * Short, conservative label describing detection confidence.
 * Never implies the difference is confirmed — confirmation is always human.
 */
export function confidenceLabel(finding: Finding): string {
  if (isPotentialMismatch(finding)) {
    return `Potential mismatch · ${confidencePercent(finding)}% detection confidence`;
  }
  return `Detected difference · ${confidencePercent(finding)}% detection confidence`;
}

/** Standard human-review reminder shown on every finding detail. */
export const HUMAN_CONFIRMATION_NOTE =
  "Needs human confirmation. This is an automated detection, not a verified result.";

/**
 * Plain-language explanation of why an item was flagged, derived from the
 * structured finding only (category, severity, and detected values).
 */
export function whyFlagged(finding: Finding): string {
  const missing =
    finding.supplierValue === null || finding.supplierValue.trim() === "";

  if (missing) {
    return "A required element present in the approved master was not detected in the supplier proof.";
  }

  switch (finding.category) {
    case FindingCategory.Barcode:
      return "The detected barcode value does not match the approved master, which can cause scanning or traceability failures.";
    case FindingCategory.Metadata:
      return "A document identifier (such as revision or SKU) differs from the approved master.";
    case FindingCategory.Symbol:
      return "A required regulatory or safety symbol could not be matched against the approved master.";
    case FindingCategory.TextContent:
      return "Text content differs from the approved master. Wording changes can alter regulatory or safety meaning.";
    case FindingCategory.Typography:
      return "The text appears to use a different font treatment than the approved master.";
    case FindingCategory.Layout:
      return "An element appears repositioned relative to the approved master.";
    case FindingCategory.Color:
      return "A visual variance was detected against the approved master. This is an appearance observation, not a calibrated color measurement.";
    case FindingCategory.MissingElement:
      return "An expected element from the approved master was not detected in the supplier proof.";
    default:
      return "A difference from the approved master was detected and requires reviewer confirmation.";
  }
}

/**
 * Severity definitions used in tooltips and legends.
 */
export const SEVERITY_DEFINITIONS: Record<FindingSeverity, string> = {
  [FindingSeverity.Critical]:
    "Critical: a difference that would likely block production approval, such as a wrong barcode, missing mandatory field, or altered safety instruction.",
  [FindingSeverity.Major]:
    "Major: a meaningful difference that should be corrected before approval, such as changed warning text or a spelling error.",
  [FindingSeverity.Minor]:
    "Minor: a small or visual variance noted for reviewer awareness, such as a slight position shift or appearance difference.",
};
