import { Finding, FindingsSummary } from "@/domain/models";
import { FindingSeverity } from "@/domain/enums";
import {
  ComparisonEngine,
  ExtractedText,
  RenderedPage,
  TextDiff,
  MetadataDiff,
  VisualDiff,
} from "@/domain/comparison-engine";
import { seedFindings, DEMO_INSPECTION_ID } from "@/data/seed";

/**
 * Demo engine that returns seeded findings.
 * Used as fallback for the prototype when no real files are processed.
 */
export class DemoEngine implements ComparisonEngine {
  async extractText(fileRef: string): Promise<ExtractedText> {
    return { fileRef, pages: [] };
  }

  async renderPages(): Promise<RenderedPage[]> {
    return [];
  }

  async compareText(): Promise<TextDiff[]> {
    return [];
  }

  async compareDocumentMetadata(): Promise<MetadataDiff[]> {
    return [];
  }

  async compareVisualRegions(): Promise<VisualDiff[]> {
    return [];
  }

  async generateFindingsSummary(findings: Finding[]): Promise<FindingsSummary> {
    const critical = findings.filter(
      (f) => f.severity === FindingSeverity.Critical
    ).length;
    const major = findings.filter(
      (f) => f.severity === FindingSeverity.Major
    ).length;
    const minor = findings.filter(
      (f) => f.severity === FindingSeverity.Minor
    ).length;

    return {
      totalFindings: findings.length,
      critical,
      major,
      minor,
      recommendation:
        critical > 0
          ? "Reject — Supplier Correction Required"
          : "Review Recommended",
      confidence: 0.95,
    };
  }

  /**
   * Returns the seeded demo findings for the BioTouch inspection.
   */
  async getDemoFindings(
    inspectionId?: string
  ): Promise<{ findings: Finding[]; summary: FindingsSummary }> {
    const targetId = inspectionId ?? DEMO_INSPECTION_ID;
    const findings = seedFindings.filter((f) => f.inspectionId === targetId);
    const summary = await this.generateFindingsSummary(findings);
    return { findings, summary };
  }
}
