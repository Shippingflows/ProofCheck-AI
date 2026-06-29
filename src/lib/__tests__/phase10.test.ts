import { describe, it, expect } from "vitest";
import {
  RECOMMENDATION_REJECT,
  RECOMMENDATION_PENDING_NOTE,
  formatRecommendation,
} from "@/lib/recommendations";
import { isDemoFormSubmission, DEMO_FORM_TITLE, DEMO_INSPECTION_ID } from "@/data/seed";
import { formatSeverityCounts } from "@/lib/format-severity";
import { correctionStatusLabel } from "@/lib/correction-status";
import { CorrectionStatus } from "@/domain/enums";
import { DemoEngine } from "@/engine/demo-engine";

describe("Phase 10 demo maturity", () => {
  it("detects demo form submissions by title and supplier", () => {
    expect(
      isDemoFormSubmission(DEMO_FORM_TITLE, "Pacific Print Solutions")
    ).toBe(true);
    expect(isDemoFormSubmission("Other title", "Pacific Print Solutions")).toBe(
      false
    );
  });

  it("uses canonical suggested QA action wording", () => {
    expect(RECOMMENDATION_REJECT).toBe(
      "Suggested QA Action: Request Supplier Correction"
    );
    const formatted = formatRecommendation(RECOMMENDATION_REJECT);
    expect(formatted.action).toBe(RECOMMENDATION_REJECT);
    expect(formatted.note).toBe(RECOMMENDATION_PENDING_NOTE);
  });

  it("formats severity counts as explicit text", () => {
    expect(formatSeverityCounts({ critical: 4, major: 3, minor: 3 })).toBe(
      "4 Critical · 3 Major · 3 Minor"
    );
  });

  it("labels draft prepared status for correction credibility", () => {
    expect(correctionStatusLabel(CorrectionStatus.DraftPrepared)).toBe(
      "Draft prepared — not sent"
    );
  });

  it("demo engine returns reject recommendation for BioTouch sample", async () => {
    const engine = new DemoEngine();
    const { summary } = await engine.getDemoFindings(DEMO_INSPECTION_ID);
    expect(summary.critical).toBeGreaterThan(0);
    expect(summary.recommendation).toBe(RECOMMENDATION_REJECT);
  });
});

describe("Approval decision note requirements", () => {
  const requiresNotes = (decision: string) =>
    decision === "approve_with_notes" || decision === "reject";

  it("requires notes for approve with notes and reject", () => {
    expect(requiresNotes("approve_with_notes")).toBe(true);
    expect(requiresNotes("reject")).toBe(true);
    expect(requiresNotes("approve")).toBe(false);
  });
});
