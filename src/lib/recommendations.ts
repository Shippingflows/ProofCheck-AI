export const RECOMMENDATION_REJECT =
  "Suggested QA Action: Request Supplier Correction";

export const RECOMMENDATION_PENDING_NOTE =
  "Final disposition requires confirmation by an authorized QA reviewer.";

export const RECOMMENDATION_SUMMARY_SENTENCE =
  "Based on the structured findings, ProofCheck recommends requesting supplier correction, pending authorized QA confirmation.";

/** Legacy strings kept for backward compatibility. */
export const LEGACY_RECOMMENDATION_REJECT =
  "Recommended Action: Reject — Supplier Correction Required";

export const LEGACY_SUGGESTED_QA_REJECT =
  "Suggested QA Action: Supplier Correction Required";

export function formatRecommendation(action: string): {
  action: string;
  note: string;
} {
  const normalized =
    action === LEGACY_RECOMMENDATION_REJECT ||
    action === LEGACY_SUGGESTED_QA_REJECT
      ? RECOMMENDATION_REJECT
      : action;

  if (
    normalized.includes("Suggested QA Action:") ||
    normalized.includes("Recommended Action:")
  ) {
    return { action: normalized, note: RECOMMENDATION_PENDING_NOTE };
  }
  return {
    action: `Suggested QA Action: ${normalized}`,
    note: RECOMMENDATION_PENDING_NOTE,
  };
}
