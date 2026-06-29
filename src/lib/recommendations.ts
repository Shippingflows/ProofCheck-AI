export const RECOMMENDATION_REJECT =
  "Suggested QA Action: Supplier Correction Required";

export const RECOMMENDATION_PENDING_NOTE =
  "Final disposition requires authorized QA reviewer confirmation.";

/** Legacy string kept for backward compatibility in seed migrations. */
export const LEGACY_RECOMMENDATION_REJECT =
  "Recommended Action: Reject — Supplier Correction Required";

export function formatRecommendation(action: string): {
  action: string;
  note: string;
} {
  if (
    action.includes("Suggested QA Action:") ||
    action.includes("Recommended Action:")
  ) {
    const normalized =
      action === LEGACY_RECOMMENDATION_REJECT ? RECOMMENDATION_REJECT : action;
    return { action: normalized, note: RECOMMENDATION_PENDING_NOTE };
  }
  return {
    action: `Suggested QA Action: ${action}`,
    note: RECOMMENDATION_PENDING_NOTE,
  };
}
