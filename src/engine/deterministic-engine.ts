import { Finding, FindingsSummary } from "@/domain/models";
import { FindingSeverity } from "@/domain/enums";
import { RECOMMENDATION_REJECT } from "@/lib/recommendations";
import {
  ComparisonEngine,
  ExtractedText,
  RenderedPage,
  FileMetadata,
  TextDiff,
  MetadataDiff,
  VisualDiff,
} from "@/domain/comparison-engine";
import {
  compareExtractedText,
  compareMetadata,
  detectAspectRatioMismatch,
  textDiffsToFindings,
  metadataDiffsToFindings,
  aspectRatioToFinding,
} from "./text-comparison";
import {
  runCriticalFieldChecks,
  type CriticalFieldCheckOutput,
  type PageComparisonSummary,
} from "./critical-fields";

/**
 * Deterministic comparison engine.
 * Performs text-based comparison without LLM or AI vision.
 * Suitable for structured documents (text-based PDFs, labeled images).
 */
export class DeterministicEngine implements ComparisonEngine {
  async extractText(_fileRef: string): Promise<ExtractedText> {
    // In production: use pdf-parse for PDFs, OCR for images.
    // For now, return empty extracted text (real extraction deferred to integration layer).
    return {
      fileRef: _fileRef,
      pages: [],
    };
  }

  async renderPages(_fileRef: string): Promise<RenderedPage[]> {
    // Placeholder — rendering pages to images requires pdf.js or similar.
    return [];
  }

  async compareText(
    master: ExtractedText,
    supplier: ExtractedText
  ): Promise<TextDiff[]> {
    return compareExtractedText(master, supplier);
  }

  async compareDocumentMetadata(
    master: FileMetadata,
    supplier: FileMetadata
  ): Promise<MetadataDiff[]> {
    return compareMetadata(master, supplier);
  }

  async compareVisualRegions(
    _masterPages: RenderedPage[],
    _supplierPages: RenderedPage[]
  ): Promise<VisualDiff[]> {
    // Placeholder for future pixel-difference comparison.
    // Architecture: compare rendered page images pixel-by-pixel,
    // identify regions exceeding a configurable difference threshold,
    // and return bounding boxes with difference scores.
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

    const avgConfidence =
      findings.length > 0
        ? findings.reduce((sum, f) => sum + f.confidence, 0) / findings.length
        : 1;

    let recommendation: string;
    if (critical > 0) {
      recommendation = RECOMMENDATION_REJECT;
    } else if (major > 0) {
      recommendation = "Review Required — Major differences detected";
    } else if (minor > 0) {
      recommendation = "Review Recommended — Minor variances noted";
    } else {
      recommendation = "No differences detected";
    }

    return {
      totalFindings: findings.length,
      critical,
      major,
      minor,
      recommendation,
      confidence: avgConfidence,
    };
  }

  /**
   * Run a full comparison given pre-extracted data.
   * Combines critical-field checks, text comparison, metadata, and dimension checks.
   */
  async runComparison(params: {
    inspectionId: string;
    profileId?: string | null;
    masterText: ExtractedText;
    supplierText: ExtractedText;
    masterMetadata: FileMetadata;
    supplierMetadata: FileMetadata;
    masterDimensions?: { width: number; height: number };
    supplierDimensions?: { width: number; height: number };
    knownValues?: Record<string, string>;
  }): Promise<{
    findings: Finding[];
    summary: FindingsSummary;
    criticalFieldResults: CriticalFieldCheckOutput | null;
    pageSummaries: PageComparisonSummary[];
  }> {
    const allFindings: Finding[] = [];
    const pageSummaries: PageComparisonSummary[] = [];
    let criticalFieldResults: CriticalFieldCheckOutput | null = null;

    // 1. Critical-field checks (highest priority)
    const masterFullText = params.masterText.pages
      .map((p) => p.content)
      .join("\n");
    const supplierFullText = params.supplierText.pages
      .map((p) => p.content)
      .join("\n");

    if (masterFullText.length > 0 || supplierFullText.length > 0) {
      criticalFieldResults = runCriticalFieldChecks({
        inspectionId: params.inspectionId,
        profileId: params.profileId ?? null,
        masterText: masterFullText,
        supplierText: supplierFullText,
        knownValues: params.knownValues,
      });
      allFindings.push(...criticalFieldResults.findings);
      pageSummaries.push(criticalFieldResults.pageSummary);
    }

    // 2. Line-level text comparison
    const textDiffs = await this.compareText(
      params.masterText,
      params.supplierText
    );
    allFindings.push(
      ...textDiffsToFindings(textDiffs, params.inspectionId)
    );

    // 3. Metadata comparison
    const metaDiffs = await this.compareDocumentMetadata(
      params.masterMetadata,
      params.supplierMetadata
    );
    allFindings.push(
      ...metadataDiffsToFindings(metaDiffs, params.inspectionId)
    );

    // 4. Aspect ratio check
    if (params.masterDimensions && params.supplierDimensions) {
      const ratio = detectAspectRatioMismatch(
        params.masterDimensions.width,
        params.masterDimensions.height,
        params.supplierDimensions.width,
        params.supplierDimensions.height
      );
      if (ratio.hasMismatch) {
        allFindings.push(
          aspectRatioToFinding(
            params.inspectionId,
            ratio.ratioDifference,
            params.masterDimensions,
            params.supplierDimensions
          )
        );
      }
    }

    const summary = await this.generateFindingsSummary(allFindings);

    return { findings: allFindings, summary, criticalFieldResults, pageSummaries };
  }
}
