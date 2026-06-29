/**
 * Critical-field checking engine.
 *
 * Provides configurable, deterministic field extraction and comparison for
 * structured packaging documents. Each field has a label, extraction patterns,
 * a match mode (exact vs. normalized), and a severity classification.
 *
 * This module never makes compliance decisions or automatic approvals.
 * All results are findings prepared for human review.
 */

import { Finding, EvidenceRegion } from "@/domain/models";
import { FindingSeverity, FindingCategory } from "@/domain/enums";
import { ENGINE_FINDING_DEFAULTS } from "./finding-defaults";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MatchMode = "exact" | "normalized" | "contains" | "presence";

export interface CriticalFieldSpec {
  id: string;
  label: string;
  category: FindingCategory;
  severity: FindingSeverity;
  matchMode: MatchMode;
  /**
   * One or more regex patterns for extracting the field value from raw text.
   * First capture group is treated as the value. If no capture group, the
   * full match is used.
   */
  extractionPatterns: RegExp[];
  /**
   * Expected value from the master / inspection spec.
   * When null, only presence/absence is checked.
   */
  expectedValue?: string | null;
  /** If true, the field must be present in the supplier text. */
  required: boolean;
}

export interface CriticalFieldResult {
  fieldSpec: CriticalFieldSpec;
  masterValue: string | null;
  supplierValue: string | null;
  matched: boolean;
  matchType: "exact" | "normalized" | "contains" | "present" | "missing" | "mismatch";
  confidence: number;
  evidence: FieldEvidence;
}

export interface FieldEvidence {
  fieldLabel: string;
  masterExtract: string | null;
  supplierExtract: string | null;
  matchMode: MatchMode;
  rule: string;
  humanNote: string;
}

export interface PageComparisonSummary {
  pageNumber: number;
  fieldsChecked: number;
  fieldsMatched: number;
  fieldsMismatched: number;
  fieldsMissing: number;
  confidence: number;
}

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

/**
 * Extracts a field value from raw text using the spec's regex patterns.
 * Tries each pattern in order, returns the first match.
 */
export function extractFieldValue(
  text: string,
  patterns: RegExp[]
): string | null {
  for (const pattern of patterns) {
    // Reset lastIndex for global patterns
    const re = new RegExp(pattern.source, pattern.flags.replace("g", ""));
    const match = re.exec(text);
    if (match) {
      return (match[1] ?? match[0]).trim();
    }
  }
  return null;
}

/**
 * Normalizes a field value for comparison. Lowercases, collapses whitespace,
 * and strips surrounding punctuation that doesn't alter meaning.
 */
export function normalizeFieldValue(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[\u2018\u2019']/g, "'")
    .replace(/[\u201C\u201D"]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

/**
 * Compares master and supplier field values according to the spec's match mode.
 */
export function matchFieldValues(
  masterValue: string | null,
  supplierValue: string | null,
  spec: CriticalFieldSpec
): CriticalFieldResult {
  const evidence: FieldEvidence = {
    fieldLabel: spec.label,
    masterExtract: masterValue,
    supplierExtract: supplierValue,
    matchMode: spec.matchMode,
    rule: "",
    humanNote: "",
  };

  // Presence-only check
  if (spec.matchMode === "presence") {
    const isPresent = supplierValue !== null && supplierValue.trim().length > 0;
    evidence.rule = "Field must be present in supplier proof.";
    evidence.humanNote = isPresent
      ? "Field detected in supplier document."
      : "Required field was not detected in the supplier document.";
    return {
      fieldSpec: spec,
      masterValue,
      supplierValue,
      matched: isPresent,
      matchType: isPresent ? "present" : "missing",
      confidence: isPresent ? 0.95 : 0.97,
      evidence,
    };
  }

  // Missing required field
  if (spec.required && (supplierValue === null || supplierValue.trim() === "")) {
    evidence.rule = `Required field "${spec.label}" must be present.`;
    evidence.humanNote = `Required field "${spec.label}" was not detected in the supplier document. This requires human verification.`;
    return {
      fieldSpec: spec,
      masterValue,
      supplierValue,
      matched: false,
      matchType: "missing",
      confidence: 0.96,
      evidence,
    };
  }

  // Master not available — can only confirm presence
  if (masterValue === null || masterValue.trim() === "") {
    evidence.rule = "No master value available; presence confirmed.";
    evidence.humanNote = "Field is present but no master value is available for comparison.";
    return {
      fieldSpec: spec,
      masterValue,
      supplierValue,
      matched: true,
      matchType: "present",
      confidence: 0.7,
      evidence,
    };
  }

  // Compare by mode
  switch (spec.matchMode) {
    case "exact": {
      const isMatch = masterValue === supplierValue;
      evidence.rule = "Exact character-for-character match required.";
      evidence.humanNote = isMatch
        ? "Values match exactly."
        : `Exact match failed. Master: "${masterValue}" vs Supplier: "${supplierValue}".`;
      return {
        fieldSpec: spec,
        masterValue,
        supplierValue,
        matched: isMatch,
        matchType: isMatch ? "exact" : "mismatch",
        confidence: isMatch ? 1.0 : computeConfidence(masterValue, supplierValue!),
        evidence,
      };
    }

    case "normalized": {
      const normalMaster = normalizeFieldValue(masterValue);
      const normalSupplier = normalizeFieldValue(supplierValue ?? "");
      const isMatch = normalMaster === normalSupplier;
      evidence.rule = "Normalized comparison (case-insensitive, whitespace-collapsed).";
      evidence.humanNote = isMatch
        ? "Values match after normalization."
        : `Normalized match failed. Master (normalized): "${normalMaster}" vs Supplier: "${normalSupplier}".`;
      return {
        fieldSpec: spec,
        masterValue,
        supplierValue,
        matched: isMatch,
        matchType: isMatch ? "normalized" : "mismatch",
        confidence: isMatch ? 0.98 : computeConfidence(masterValue, supplierValue!),
        evidence,
      };
    }

    case "contains": {
      const normalMaster = normalizeFieldValue(masterValue);
      const normalSupplier = normalizeFieldValue(supplierValue ?? "");
      const isMatch = normalSupplier.includes(normalMaster);
      evidence.rule = "Supplier text must contain the approved master value.";
      evidence.humanNote = isMatch
        ? "Supplier text contains the required value."
        : `Supplier text does not contain the master value "${masterValue}".`;
      return {
        fieldSpec: spec,
        masterValue,
        supplierValue,
        matched: isMatch,
        matchType: isMatch ? "contains" : "mismatch",
        confidence: isMatch ? 0.95 : computeConfidence(masterValue, supplierValue!),
        evidence,
      };
    }

    default:
      evidence.rule = "Unknown match mode.";
      evidence.humanNote = "Could not determine match mode.";
      return {
        fieldSpec: spec,
        masterValue,
        supplierValue,
        matched: false,
        matchType: "mismatch",
        confidence: 0.5,
        evidence,
      };
  }
}

// ---------------------------------------------------------------------------
// Confidence scoring
// ---------------------------------------------------------------------------

/**
 * Computes a deterministic confidence score for a field mismatch.
 * Based on edit distance and character overlap — not LLM guessing.
 */
export function computeConfidence(
  masterValue: string,
  supplierValue: string
): number {
  if (masterValue === supplierValue) return 1.0;

  const maxLen = Math.max(masterValue.length, supplierValue.length);
  if (maxLen === 0) return 1.0;

  let commonChars = 0;
  const shorter = masterValue.length <= supplierValue.length ? masterValue : supplierValue;
  const longer = masterValue.length <= supplierValue.length ? supplierValue : masterValue;

  for (let i = 0; i < shorter.length; i++) {
    if (shorter[i] === longer[i]) commonChars++;
  }

  const positionalSimilarity = commonChars / maxLen;

  // High confidence that a difference exists when strings are similar but not identical
  // More similar strings = higher confidence the difference is real (not noise)
  return Math.min(0.99, 0.85 + positionalSimilarity * 0.14);
}

// ---------------------------------------------------------------------------
// Findings conversion
// ---------------------------------------------------------------------------

/**
 * Converts a CriticalFieldResult into a Finding object for the UI.
 */
export function criticalFieldResultToFinding(
  result: CriticalFieldResult,
  inspectionId: string,
  index: number,
  region?: EvidenceRegion | null
): Finding {
  const { fieldSpec, masterValue, supplierValue, matchType, confidence, evidence } = result;

  let title: string;
  let description: string;

  switch (matchType) {
    case "missing":
      title = `Required field missing: ${fieldSpec.label}`;
      description = `The required field "${fieldSpec.label}" was not detected in the supplier document. ${evidence.humanNote}`;
      break;
    case "mismatch":
      title = `${fieldSpec.label} mismatch`;
      description = `${fieldSpec.label} differs from the approved master. ${evidence.humanNote}`;
      break;
    default:
      title = `${fieldSpec.label} verified`;
      description = evidence.humanNote;
  }

  return {
    id: `find_cf_${inspectionId}_${index}`,
    inspectionId,
    severity: fieldSpec.severity,
    category: fieldSpec.category,
    title,
    description,
    sourceValue: masterValue,
    supplierValue: supplierValue,
    location: `Critical field: ${fieldSpec.label}`,
    pageNumber: 1,
    confidence,
    evidenceRegion: region ?? null,
    reviewerVerified: null,
    ...ENGINE_FINDING_DEFAULTS,
    detectionMethod: "Critical field rule check",
  };
}

// ---------------------------------------------------------------------------
// Profile-based field sets
// ---------------------------------------------------------------------------

/**
 * Default critical fields for the medical device packaging profile.
 * Each has specific regex patterns for extraction from document text.
 */
export const MEDICAL_DEVICE_FIELDS: CriticalFieldSpec[] = [
  {
    id: "revision",
    label: "Revision number",
    category: FindingCategory.Metadata,
    severity: FindingSeverity.Critical,
    matchMode: "exact",
    extractionPatterns: [
      /REV[:\s-]*(\S+)/i,
      /revision[:\s]*(\S+)/i,
      /rev\.\s*(\S+)/i,
    ],
    required: true,
  },
  {
    id: "sku",
    label: "SKU / Product code",
    category: FindingCategory.Metadata,
    severity: FindingSeverity.Critical,
    matchMode: "exact",
    extractionPatterns: [
      /SKU[:\s]*([A-Z0-9][\w-]+)/i,
      /product\s*code[:\s]*([A-Z0-9][\w-]+)/i,
      /catalogue\s*(?:no|number|#)?[.:\s]*([A-Z0-9][\w-]+)/i,
    ],
    required: true,
  },
  {
    id: "barcode",
    label: "Barcode number",
    category: FindingCategory.Barcode,
    severity: FindingSeverity.Critical,
    matchMode: "exact",
    extractionPatterns: [
      /(\d{4}[- ]?\d{4}[- ]?\d{2,4})/,
      /(?:EAN|UPC|GTIN)[:\s]*(\d[\d\s-]+)/i,
      /barcode[:\s]*([\d\s-]+)/i,
    ],
    required: true,
  },
  {
    id: "warning_text",
    label: "Warning text",
    category: FindingCategory.TextContent,
    severity: FindingSeverity.Major,
    matchMode: "normalized",
    extractionPatterns: [
      /(?:warning|caution)[:\s]*(.+)/i,
      /for professional use[^\n]*/i,
    ],
    required: true,
  },
  {
    id: "storage",
    label: "Storage conditions",
    category: FindingCategory.TextContent,
    severity: FindingSeverity.Critical,
    matchMode: "exact",
    extractionPatterns: [
      /store\s+at\s+([^\n.]+)/i,
      /storage[:\s]*([^\n.]+)/i,
      /(\d+\s*[-–]\s*\d+\s*°[CF])/i,
    ],
    required: true,
  },
  {
    id: "lot_field",
    label: "LOT number field",
    category: FindingCategory.MissingElement,
    severity: FindingSeverity.Critical,
    matchMode: "presence",
    extractionPatterns: [
      /LOT[:\s]/i,
      /lot\s*(?:no|number|#)?[:\s]/i,
      /batch[:\s]/i,
    ],
    required: true,
  },
  {
    id: "exp_field",
    label: "EXP / Use-by field",
    category: FindingCategory.MissingElement,
    severity: FindingSeverity.Critical,
    matchMode: "presence",
    extractionPatterns: [
      /EXP[:\s]/i,
      /expir[ey]\s*(?:date)?[:\s]/i,
      /use\s*by[:\s]/i,
      /best\s*before[:\s]/i,
    ],
    required: true,
  },
];

/**
 * Returns the appropriate field specs for a given profile ID.
 * Falls back to the medical device set.
 */
export function getFieldSpecsForProfile(
  profileId: string | null
): CriticalFieldSpec[] {
  switch (profileId) {
    case "profile_medical_device_01":
      return MEDICAL_DEVICE_FIELDS;
    case "profile_pharma_label_01":
      return MEDICAL_DEVICE_FIELDS; // reuse for now
    case "profile_food_packaging_01":
      return MEDICAL_DEVICE_FIELDS.filter(
        (f) => f.id !== "lot_field" // food packaging may not need LOT
      );
    default:
      return MEDICAL_DEVICE_FIELDS;
  }
}

// ---------------------------------------------------------------------------
// Top-level runner
// ---------------------------------------------------------------------------

export interface CriticalFieldCheckInput {
  inspectionId: string;
  profileId: string | null;
  masterText: string;
  supplierText: string;
  /** Optional known values from the inspection spec (e.g. typed by reviewer). */
  knownValues?: Record<string, string>;
}

export interface CriticalFieldCheckOutput {
  results: CriticalFieldResult[];
  findings: Finding[];
  pageSummary: PageComparisonSummary;
}

/**
 * Runs all critical-field checks for a document pair.
 * Extracts values from both documents, compares, and returns structured findings.
 */
export function runCriticalFieldChecks(
  input: CriticalFieldCheckInput
): CriticalFieldCheckOutput {
  const specs = getFieldSpecsForProfile(input.profileId);
  const results: CriticalFieldResult[] = [];
  const findings: Finding[] = [];

  for (const spec of specs) {
    // Extract from master
    let masterValue = extractFieldValue(input.masterText, spec.extractionPatterns);

    // If known values were provided by the reviewer, prefer them
    if (input.knownValues && input.knownValues[spec.id]) {
      masterValue = input.knownValues[spec.id];
    }

    // Extract from supplier
    const supplierValue = extractFieldValue(
      input.supplierText,
      spec.extractionPatterns
    );

    // Compare
    const result = matchFieldValues(masterValue, supplierValue, spec);
    results.push(result);

    // Only emit findings for mismatches/missing
    if (!result.matched) {
      findings.push(
        criticalFieldResultToFinding(result, input.inspectionId, findings.length)
      );
    }
  }

  const matched = results.filter((r) => r.matched).length;
  const mismatched = results.filter(
    (r) => !r.matched && r.matchType === "mismatch"
  ).length;
  const missing = results.filter(
    (r) => !r.matched && r.matchType === "missing"
  ).length;

  const avgConfidence =
    results.length > 0
      ? results.reduce((s, r) => s + r.confidence, 0) / results.length
      : 1.0;

  const pageSummary: PageComparisonSummary = {
    pageNumber: 1,
    fieldsChecked: results.length,
    fieldsMatched: matched,
    fieldsMismatched: mismatched,
    fieldsMissing: missing,
    confidence: avgConfidence,
  };

  return { results, findings, pageSummary };
}
