import { describe, it, expect } from "vitest";
import {
  extractFieldValue,
  normalizeFieldValue,
  matchFieldValues,
  computeConfidence,
  runCriticalFieldChecks,
  MEDICAL_DEVICE_FIELDS,
  getFieldSpecsForProfile,
  type CriticalFieldSpec,
} from "../critical-fields";
import { FindingSeverity, FindingCategory } from "@/domain/enums";

// ---------------------------------------------------------------------------
// extractFieldValue
// ---------------------------------------------------------------------------

describe("extractFieldValue", () => {
  it("extracts revision from 'REV-04' format", () => {
    const text = "SKU: BT-SCK-240\nREV-04";
    const patterns = [/REV[:\s-]*(\S+)/i];
    expect(extractFieldValue(text, patterns)).toBe("04");
  });

  it("extracts revision from 'Revision: REV-04' format", () => {
    const text = "Revision: REV-04\nSome other text";
    const patterns = [/revision[:\s]*(\S+)/i];
    expect(extractFieldValue(text, patterns)).toBe("REV-04");
  });

  it("extracts SKU from 'SKU: BT-SCK-240'", () => {
    const text = "Product info\nSKU: BT-SCK-240\nRev 04";
    const patterns = [/SKU[:\s]*([A-Z0-9][\w-]+)/i];
    expect(extractFieldValue(text, patterns)).toBe("BT-SCK-240");
  });

  it("extracts barcode with dashes", () => {
    const text = "Reference code\n8421-9940-22";
    const patterns = [/(\d{4}[- ]?\d{4}[- ]?\d{2,4})/];
    expect(extractFieldValue(text, patterns)).toBe("8421-9940-22");
  });

  it("extracts barcode without dashes", () => {
    const text = "EAN: 5901234123457";
    const patterns = [/(?:EAN|UPC|GTIN)[:\s]*(\d[\d\s-]+)/i];
    expect(extractFieldValue(text, patterns)).toBe("5901234123457");
  });

  it("extracts storage conditions", () => {
    const text = "Storage: Store at 2–8°C";
    const patterns = [/store\s+at\s+([^\n.]+)/i];
    expect(extractFieldValue(text, patterns)).toBe("2–8°C");
  });

  it("extracts warning text", () => {
    const text = "Warning: For professional use only";
    const patterns = [/(?:warning|caution)[:\s]*(.+)/i];
    expect(extractFieldValue(text, patterns)).toBe("For professional use only");
  });

  it("detects LOT field presence", () => {
    const text = "LOT: ______\nEXP: ______";
    const patterns = [/LOT[:\s]/i];
    expect(extractFieldValue(text, patterns)).not.toBeNull();
  });

  it("returns null when field is absent", () => {
    const text = "Some unrelated text\nno matching here";
    const patterns = [/LOT[:\s]/i, /batch[:\s]/i];
    expect(extractFieldValue(text, patterns)).toBeNull();
  });

  it("tries multiple patterns and returns first match", () => {
    const text = "product code: XY-123";
    const patterns = [
      /SKU[:\s]*([A-Z0-9][\w-]+)/i,
      /product\s*code[:\s]*([A-Z0-9][\w-]+)/i,
    ];
    expect(extractFieldValue(text, patterns)).toBe("XY-123");
  });
});

// ---------------------------------------------------------------------------
// normalizeFieldValue
// ---------------------------------------------------------------------------

describe("normalizeFieldValue", () => {
  it("lowercases and trims", () => {
    expect(normalizeFieldValue("  HELLO WORLD  ")).toBe("hello world");
  });

  it("collapses multiple whitespace", () => {
    expect(normalizeFieldValue("a   b\t\tc")).toBe("a b c");
  });

  it("normalizes smart quotes", () => {
    expect(normalizeFieldValue("\u2018test\u2019")).toBe("'test'");
  });

  it("normalizes em-dashes to hyphens", () => {
    expect(normalizeFieldValue("2\u20148")).toBe("2-8");
  });
});

// ---------------------------------------------------------------------------
// matchFieldValues
// ---------------------------------------------------------------------------

describe("matchFieldValues", () => {
  const exactSpec: CriticalFieldSpec = {
    id: "test",
    label: "Test Field",
    category: FindingCategory.Metadata,
    severity: FindingSeverity.Critical,
    matchMode: "exact",
    extractionPatterns: [],
    required: true,
  };

  const normalizedSpec: CriticalFieldSpec = {
    ...exactSpec,
    id: "test_norm",
    matchMode: "normalized",
  };

  const containsSpec: CriticalFieldSpec = {
    ...exactSpec,
    id: "test_contains",
    matchMode: "contains",
    severity: FindingSeverity.Major,
  };

  const presenceSpec: CriticalFieldSpec = {
    ...exactSpec,
    id: "test_presence",
    matchMode: "presence",
  };

  it("exact match: identical values pass", () => {
    const result = matchFieldValues("REV-04", "REV-04", exactSpec);
    expect(result.matched).toBe(true);
    expect(result.matchType).toBe("exact");
    expect(result.confidence).toBe(1.0);
  });

  it("exact match: different values fail", () => {
    const result = matchFieldValues("REV-04", "REV-03", exactSpec);
    expect(result.matched).toBe(false);
    expect(result.matchType).toBe("mismatch");
    expect(result.confidence).toBeGreaterThan(0.85);
  });

  it("exact match: case matters", () => {
    const result = matchFieldValues("BT-SCK-240", "bt-sck-240", exactSpec);
    expect(result.matched).toBe(false);
    expect(result.matchType).toBe("mismatch");
  });

  it("normalized match: case-insensitive passes", () => {
    const result = matchFieldValues(
      "For professional use only",
      "for professional use only",
      normalizedSpec
    );
    expect(result.matched).toBe(true);
    expect(result.matchType).toBe("normalized");
  });

  it("normalized match: extra whitespace passes", () => {
    const result = matchFieldValues(
      "Store at 2-8°C",
      "Store  at  2-8°C",
      normalizedSpec
    );
    expect(result.matched).toBe(true);
  });

  it("normalized match: different content fails", () => {
    const result = matchFieldValues(
      "For professional use only",
      "For professional use",
      normalizedSpec
    );
    expect(result.matched).toBe(false);
    expect(result.matchType).toBe("mismatch");
  });

  it("contains match: supplier contains master passes", () => {
    const result = matchFieldValues(
      "professional use only",
      "For professional use only by licensed staff",
      containsSpec
    );
    expect(result.matched).toBe(true);
    expect(result.matchType).toBe("contains");
  });

  it("contains match: supplier missing content fails", () => {
    const result = matchFieldValues(
      "professional use only",
      "For professional use",
      containsSpec
    );
    expect(result.matched).toBe(false);
  });

  it("presence: field present passes", () => {
    const result = matchFieldValues("LOT:", "LOT: 12345", presenceSpec);
    expect(result.matched).toBe(true);
    expect(result.matchType).toBe("present");
  });

  it("presence: field absent fails", () => {
    const result = matchFieldValues("LOT:", null, presenceSpec);
    expect(result.matched).toBe(false);
    expect(result.matchType).toBe("missing");
  });

  it("presence: empty string fails", () => {
    const result = matchFieldValues("LOT:", "   ", presenceSpec);
    expect(result.matched).toBe(false);
    expect(result.matchType).toBe("missing");
  });

  it("required missing field returns missing type", () => {
    const result = matchFieldValues("REV-04", null, exactSpec);
    expect(result.matched).toBe(false);
    expect(result.matchType).toBe("missing");
    expect(result.confidence).toBe(0.96);
  });

  it("evidence object is always populated", () => {
    const result = matchFieldValues("REV-04", "REV-03", exactSpec);
    expect(result.evidence).toBeDefined();
    expect(result.evidence.fieldLabel).toBe("Test Field");
    expect(result.evidence.masterExtract).toBe("REV-04");
    expect(result.evidence.supplierExtract).toBe("REV-03");
    expect(result.evidence.rule).toBeTruthy();
    expect(result.evidence.humanNote).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// computeConfidence
// ---------------------------------------------------------------------------

describe("computeConfidence", () => {
  it("returns 1.0 for identical strings", () => {
    expect(computeConfidence("hello", "hello")).toBe(1.0);
  });

  it("returns high confidence for similar strings", () => {
    const conf = computeConfidence("REV-04", "REV-03");
    expect(conf).toBeGreaterThan(0.9);
    expect(conf).toBeLessThan(1.0);
  });

  it("returns high confidence for one-char difference", () => {
    const conf = computeConfidence("8421-9940-22", "8421-9040-22");
    expect(conf).toBeGreaterThan(0.9);
  });

  it("returns lower confidence for very different strings", () => {
    const conf = computeConfidence("Store at 2–8°C", "COMPLETELY DIFFERENT");
    expect(conf).toBeLessThanOrEqual(0.99);
    expect(conf).toBeGreaterThanOrEqual(0.85);
  });

  it("handles empty strings", () => {
    expect(computeConfidence("", "")).toBe(1.0);
  });
});

// ---------------------------------------------------------------------------
// runCriticalFieldChecks (integration)
// ---------------------------------------------------------------------------

describe("runCriticalFieldChecks", () => {
  const masterText = [
    "BioTouch Sample Collection Kit",
    "SKU: BT-SCK-240",
    "REV-04",
    "Store at 2–8°C",
    "Warning: For professional use only",
    "LOT: ______",
    "EXP: ______",
    "8421-9940-22",
  ].join("\n");

  it("detects no issues when supplier matches master", () => {
    const result = runCriticalFieldChecks({
      inspectionId: "test",
      profileId: "profile_medical_device_01",
      masterText,
      supplierText: masterText,
    });
    expect(result.findings).toHaveLength(0);
    expect(result.pageSummary.fieldsMatched).toBe(result.pageSummary.fieldsChecked);
  });

  it("detects revision mismatch", () => {
    const supplierText = masterText.replace("REV-04", "REV-03");
    const result = runCriticalFieldChecks({
      inspectionId: "test",
      profileId: "profile_medical_device_01",
      masterText,
      supplierText,
    });
    const revFinding = result.findings.find((f) =>
      f.title.toLowerCase().includes("revision")
    );
    expect(revFinding).toBeDefined();
    expect(revFinding!.severity).toBe(FindingSeverity.Critical);
    expect(revFinding!.sourceValue).toContain("04");
    expect(revFinding!.supplierValue).toContain("03");
  });

  it("detects barcode mismatch (single digit)", () => {
    const supplierText = masterText.replace("8421-9940-22", "8421-9040-22");
    const result = runCriticalFieldChecks({
      inspectionId: "test",
      profileId: "profile_medical_device_01",
      masterText,
      supplierText,
    });
    const bcFinding = result.findings.find((f) =>
      f.title.toLowerCase().includes("barcode")
    );
    expect(bcFinding).toBeDefined();
    expect(bcFinding!.severity).toBe(FindingSeverity.Critical);
  });

  it("detects missing LOT field", () => {
    const supplierText = masterText.replace("LOT: ______\n", "");
    const result = runCriticalFieldChecks({
      inspectionId: "test",
      profileId: "profile_medical_device_01",
      masterText,
      supplierText,
    });
    const lotFinding = result.findings.find((f) =>
      f.title.toLowerCase().includes("lot")
    );
    expect(lotFinding).toBeDefined();
    expect(lotFinding!.severity).toBe(FindingSeverity.Critical);
    expect(lotFinding!.category).toBe(FindingCategory.MissingElement);
  });

  it("detects storage condition change", () => {
    const supplierText = masterText.replace("Store at 2–8°C", "Store at 2–6°C");
    const result = runCriticalFieldChecks({
      inspectionId: "test",
      profileId: "profile_medical_device_01",
      masterText,
      supplierText,
    });
    const storageFinding = result.findings.find((f) =>
      f.title.toLowerCase().includes("storage")
    );
    expect(storageFinding).toBeDefined();
    expect(storageFinding!.severity).toBe(FindingSeverity.Critical);
  });

  it("detects warning text change (word removed)", () => {
    const supplierText = masterText.replace(
      "For professional use only",
      "For professional use"
    );
    const result = runCriticalFieldChecks({
      inspectionId: "test",
      profileId: "profile_medical_device_01",
      masterText,
      supplierText,
    });
    const warnFinding = result.findings.find((f) =>
      f.title.toLowerCase().includes("warning")
    );
    expect(warnFinding).toBeDefined();
    expect(warnFinding!.severity).toBe(FindingSeverity.Major);
  });

  it("detects multiple issues simultaneously", () => {
    const supplierText = masterText
      .replace("REV-04", "REV-03")
      .replace("8421-9940-22", "8421-9040-22")
      .replace("LOT: ______\n", "")
      .replace("Store at 2–8°C", "Store at 2–6°C");
    const result = runCriticalFieldChecks({
      inspectionId: "test",
      profileId: "profile_medical_device_01",
      masterText,
      supplierText,
    });
    expect(result.findings.length).toBeGreaterThanOrEqual(4);
    expect(result.pageSummary.fieldsMismatched + result.pageSummary.fieldsMissing).toBeGreaterThanOrEqual(4);
  });

  it("uses known values when provided", () => {
    const supplierText = "Some text\nREV-03\nSKU: BT-SCK-240";
    const result = runCriticalFieldChecks({
      inspectionId: "test",
      profileId: "profile_medical_device_01",
      masterText: "No parseable master",
      supplierText,
      knownValues: { revision: "REV-04", sku: "BT-SCK-240" },
    });
    const revFinding = result.findings.find((f) =>
      f.title.toLowerCase().includes("revision")
    );
    expect(revFinding).toBeDefined();
    expect(revFinding!.sourceValue).toBe("REV-04");
  });

  it("returns a page-level summary", () => {
    const result = runCriticalFieldChecks({
      inspectionId: "test",
      profileId: "profile_medical_device_01",
      masterText,
      supplierText: masterText,
    });
    expect(result.pageSummary.pageNumber).toBe(1);
    expect(result.pageSummary.fieldsChecked).toBe(MEDICAL_DEVICE_FIELDS.length);
    expect(result.pageSummary.confidence).toBeGreaterThan(0);
    expect(result.pageSummary.confidence).toBeLessThanOrEqual(1);
  });

  it("findings include structured evidence", () => {
    const supplierText = masterText.replace("REV-04", "REV-03");
    const result = runCriticalFieldChecks({
      inspectionId: "test",
      profileId: "profile_medical_device_01",
      masterText,
      supplierText,
    });
    const finding = result.findings[0];
    expect(finding).toBeDefined();
    expect(finding.description).toBeTruthy();
    expect(finding.sourceValue).toBeTruthy();
    expect(finding.confidence).toBeGreaterThan(0);
    expect(finding.confidence).toBeLessThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// getFieldSpecsForProfile
// ---------------------------------------------------------------------------

describe("getFieldSpecsForProfile", () => {
  it("returns medical device fields for medical profile", () => {
    const specs = getFieldSpecsForProfile("profile_medical_device_01");
    expect(specs.length).toBe(MEDICAL_DEVICE_FIELDS.length);
  });

  it("returns fields for food packaging profile (no LOT)", () => {
    const specs = getFieldSpecsForProfile("profile_food_packaging_01");
    expect(specs.length).toBeLessThan(MEDICAL_DEVICE_FIELDS.length);
    expect(specs.find((s) => s.id === "lot_field")).toBeUndefined();
  });

  it("returns default fields for null profile", () => {
    const specs = getFieldSpecsForProfile(null);
    expect(specs.length).toBe(MEDICAL_DEVICE_FIELDS.length);
  });
});
