export const RECOMMENDATION_REJECT =
  "Recommended Action: Reject — Supplier Correction Required";

export const RECOMMENDATION_PENDING_NOTE = "Pending human QA confirmation";

export function formatRecommendation(action: string): {
  action: string;
  note: string;
} {
  if (action.includes("Recommended Action:")) {
    return { action, note: RECOMMENDATION_PENDING_NOTE };
  }
  return {
    action: `Recommended Action: ${action}`,
    note: RECOMMENDATION_PENDING_NOTE,
  };
}
