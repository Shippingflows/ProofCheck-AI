import { describe, it, expect } from "vitest";
import {
  classifyTextMismatch,
  classifyPageCountMismatch,
  classifyDimensionMismatch,
} from "../severity-mapping";
import { FindingSeverity, FindingCategory } from "@/domain/enums";

describe("classifyTextMismatch", () => {
  it("classifies missing value as critical", () => {
    const result = classifyTextMismatch("lot", "LOT: ______", null, 1.0);
    expect(result.severity).toBe(FindingSeverity.Critical);
    expect(result.isPotentialMismatch).toBe(false);
  });

  it("classifies empty supplier value as critical", () => {
    const result = classifyTextMismatch("field", "Some value", "", 1.0);
    expect(result.severity).toBe(FindingSeverity.Critical);
  });

  it("classifies barcode changes as critical", () => {
    const result = classifyTextMismatch(
      "barcode",
      "8421-9940-22",
      "8421-9040-22",
      0.08
    );
    expect(result.severity).toBe(FindingSeverity.Critical);
    expect(result.category).toBe(FindingCategory.Barcode);
  });

  it("classifies revision changes as critical", () => {
    const result = classifyTextMismatch(
      "revision",
      "REV-04",
      "REV-03",
      0.16
    );
    expect(result.severity).toBe(FindingSeverity.Critical);
    expect(result.category).toBe(FindingCategory.Metadata);
  });

  it("classifies temperature/storage changes as critical", () => {
    const result = classifyTextMismatch(
      "storage",
      "Store at 2–8°C",
      "Store at 2–6°C",
      0.07
    );
    expect(result.severity).toBe(FindingSeverity.Critical);
  });

  it("classifies warning text changes as major", () => {
    const result = classifyTextMismatch(
      "warning text",
      "For professional use only",
      "For professional use",
      0.1
    );
    expect(result.severity).toBe(FindingSeverity.Major);
  });

  it("classifies small edit distance as major (typo)", () => {
    const result = classifyTextMismatch(
      "product name",
      "Collection",
      "Collecton",
      0.1
    );
    expect(result.severity).toBe(FindingSeverity.Major);
    expect(result.isPotentialMismatch).toBe(false);
  });

  it("classifies medium edit distance as major potential mismatch", () => {
    const result = classifyTextMismatch(
      "description",
      "Original text here",
      "Modified different text",
      0.3
    );
    expect(result.severity).toBe(FindingSeverity.Major);
    expect(result.isPotentialMismatch).toBe(true);
  });

  it("classifies large edit distance as minor potential mismatch", () => {
    const result = classifyTextMismatch(
      "description",
      "Completely original",
      "Totally different content here",
      0.6
    );
    expect(result.severity).toBe(FindingSeverity.Minor);
    expect(result.isPotentialMismatch).toBe(true);
  });

  it("flags uncertain results as potential mismatch", () => {
    const result = classifyTextMismatch(
      "general field",
      "Some value",
      "Another value",
      0.5
    );
    expect(result.isPotentialMismatch).toBe(true);
    expect(result.confidence).toBeLessThan(0.9);
  });
});

describe("classifyPageCountMismatch", () => {
  it("returns critical severity", () => {
    const result = classifyPageCountMismatch();
    expect(result.severity).toBe(FindingSeverity.Critical);
    expect(result.category).toBe(FindingCategory.Metadata);
    expect(result.confidence).toBe(1.0);
    expect(result.isPotentialMismatch).toBe(false);
  });
});

describe("classifyDimensionMismatch", () => {
  it("returns major severity for large ratio difference", () => {
    const result = classifyDimensionMismatch(0.2);
    expect(result.severity).toBe(FindingSeverity.Major);
    expect(result.category).toBe(FindingCategory.Layout);
    expect(result.isPotentialMismatch).toBe(false);
  });

  it("returns minor severity for small ratio difference", () => {
    const result = classifyDimensionMismatch(0.05);
    expect(result.severity).toBe(FindingSeverity.Minor);
    expect(result.category).toBe(FindingCategory.Layout);
    expect(result.isPotentialMismatch).toBe(true);
  });

  it("uses 0.1 as threshold between major and minor", () => {
    const major = classifyDimensionMismatch(0.11);
    const minor = classifyDimensionMismatch(0.09);
    expect(major.severity).toBe(FindingSeverity.Major);
    expect(minor.severity).toBe(FindingSeverity.Minor);
  });
});
