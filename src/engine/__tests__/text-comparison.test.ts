import { describe, it, expect } from "vitest";
import {
  compareExtractedText,
  compareMetadata,
  detectAspectRatioMismatch,
  textDiffsToFindings,
  metadataDiffsToFindings,
  aspectRatioToFinding,
} from "../text-comparison";
import { ExtractedText, FileMetadata } from "@/domain/comparison-engine";
import { FindingSeverity, FindingCategory } from "@/domain/enums";

describe("compareExtractedText", () => {
  it("returns empty diffs for identical text", () => {
    const master: ExtractedText = {
      fileRef: "master.pdf",
      pages: [{ pageNumber: 1, content: "Hello World", regions: [] }],
    };
    const supplier: ExtractedText = {
      fileRef: "supplier.pdf",
      pages: [{ pageNumber: 1, content: "Hello World", regions: [] }],
    };

    const diffs = compareExtractedText(master, supplier);
    expect(diffs).toHaveLength(0);
  });

  it("detects text differences", () => {
    const master: ExtractedText = {
      fileRef: "master.pdf",
      pages: [{ pageNumber: 1, content: "Store at 2–8°C", regions: [] }],
    };
    const supplier: ExtractedText = {
      fileRef: "supplier.pdf",
      pages: [{ pageNumber: 1, content: "Store at 2–6°C", regions: [] }],
    };

    const diffs = compareExtractedText(master, supplier);
    expect(diffs.length).toBeGreaterThan(0);
    expect(diffs[0].masterText).toBe("Store at 2–8°C");
    expect(diffs[0].supplierText).toBe("Store at 2–6°C");
  });

  it("detects missing pages in supplier", () => {
    const master: ExtractedText = {
      fileRef: "master.pdf",
      pages: [
        { pageNumber: 1, content: "Page 1", regions: [] },
        { pageNumber: 2, content: "Page 2", regions: [] },
      ],
    };
    const supplier: ExtractedText = {
      fileRef: "supplier.pdf",
      pages: [{ pageNumber: 1, content: "Page 1", regions: [] }],
    };

    const diffs = compareExtractedText(master, supplier);
    expect(diffs.length).toBe(1);
    expect(diffs[0].location).toContain("missing in supplier");
  });

  it("detects extra pages in supplier", () => {
    const master: ExtractedText = {
      fileRef: "master.pdf",
      pages: [{ pageNumber: 1, content: "Page 1", regions: [] }],
    };
    const supplier: ExtractedText = {
      fileRef: "supplier.pdf",
      pages: [
        { pageNumber: 1, content: "Page 1", regions: [] },
        { pageNumber: 2, content: "Extra page", regions: [] },
      ],
    };

    const diffs = compareExtractedText(master, supplier);
    expect(diffs.length).toBe(1);
    expect(diffs[0].location).toContain("extra page in supplier");
  });

  it("ignores whitespace-only differences", () => {
    const master: ExtractedText = {
      fileRef: "master.pdf",
      pages: [{ pageNumber: 1, content: "Hello   World", regions: [] }],
    };
    const supplier: ExtractedText = {
      fileRef: "supplier.pdf",
      pages: [{ pageNumber: 1, content: "hello world", regions: [] }],
    };

    const diffs = compareExtractedText(master, supplier);
    expect(diffs).toHaveLength(0);
  });

  it("handles multiline content comparison", () => {
    const master: ExtractedText = {
      fileRef: "master.pdf",
      pages: [
        {
          pageNumber: 1,
          content: "Line 1\nLine 2\nLine 3",
          regions: [],
        },
      ],
    };
    const supplier: ExtractedText = {
      fileRef: "supplier.pdf",
      pages: [
        {
          pageNumber: 1,
          content: "Line 1\nChanged line\nLine 3",
          regions: [],
        },
      ],
    };

    const diffs = compareExtractedText(master, supplier);
    expect(diffs.length).toBe(1);
    expect(diffs[0].masterText).toBe("Line 2");
    expect(diffs[0].supplierText).toBe("Changed line");
  });
});

describe("compareMetadata", () => {
  const baseMeta: FileMetadata = {
    fileRef: "test.pdf",
    fileName: "test.pdf",
    fileSize: 1024,
    mimeType: "application/pdf",
    pageCount: 4,
    createdAt: "2025-01-01",
    modifiedAt: "2025-01-01",
    producer: null,
    author: null,
  };

  it("returns empty for identical metadata", () => {
    const diffs = compareMetadata(baseMeta, baseMeta);
    expect(diffs).toHaveLength(0);
  });

  it("detects page count mismatch", () => {
    const supplier = { ...baseMeta, pageCount: 3 };
    const diffs = compareMetadata(baseMeta, supplier);
    expect(diffs.length).toBe(1);
    expect(diffs[0].field).toBe("pageCount");
    expect(diffs[0].masterValue).toBe("4");
    expect(diffs[0].supplierValue).toBe("3");
  });

  it("detects mime type mismatch", () => {
    const supplier = { ...baseMeta, mimeType: "image/png" };
    const diffs = compareMetadata(baseMeta, supplier);
    expect(diffs.length).toBe(1);
    expect(diffs[0].field).toBe("mimeType");
  });
});

describe("detectAspectRatioMismatch", () => {
  it("returns no mismatch for same dimensions", () => {
    const result = detectAspectRatioMismatch(800, 600, 800, 600);
    expect(result.hasMismatch).toBe(false);
  });

  it("returns no mismatch for same ratio different size", () => {
    const result = detectAspectRatioMismatch(800, 600, 400, 300);
    expect(result.hasMismatch).toBe(false);
  });

  it("detects significant ratio difference", () => {
    const result = detectAspectRatioMismatch(800, 600, 800, 800);
    expect(result.hasMismatch).toBe(true);
    expect(result.ratioDifference).toBeGreaterThan(0.02);
  });

  it("handles zero dimensions gracefully", () => {
    const result = detectAspectRatioMismatch(0, 600, 800, 600);
    expect(result.hasMismatch).toBe(false);
  });
});

describe("textDiffsToFindings", () => {
  it("converts text diffs to Finding objects", () => {
    const diffs = [
      {
        pageNumber: 1,
        masterText: "REV-04",
        supplierText: "REV-03",
        location: "Page 1, line 1",
        confidence: 0.98,
      },
    ];

    const findings = textDiffsToFindings(diffs, "test_insp");
    expect(findings).toHaveLength(1);
    expect(findings[0].inspectionId).toBe("test_insp");
    expect(findings[0].sourceValue).toBe("REV-04");
    expect(findings[0].supplierValue).toBe("REV-03");
    expect(findings[0].pageNumber).toBe(1);
  });

  it("marks missing supplier content", () => {
    const diffs = [
      {
        pageNumber: 1,
        masterText: "LOT: ______",
        supplierText: "",
        location: "Page 1, line 5",
        confidence: 1.0,
      },
    ];

    const findings = textDiffsToFindings(diffs, "test_insp");
    expect(findings[0].severity).toBe(FindingSeverity.Critical);
    expect(findings[0].title).toContain("Missing content");
  });
});

describe("metadataDiffsToFindings", () => {
  it("creates page count mismatch finding", () => {
    const diffs = [{ field: "pageCount", masterValue: "4", supplierValue: "3" }];
    const findings = metadataDiffsToFindings(diffs, "test_insp");
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe(FindingSeverity.Critical);
    expect(findings[0].category).toBe(FindingCategory.Metadata);
    expect(findings[0].title).toBe("Page count mismatch");
  });
});

describe("aspectRatioToFinding", () => {
  it("creates a layout finding for dimension mismatch", () => {
    const finding = aspectRatioToFinding(
      "test_insp",
      0.15,
      { width: 800, height: 600 },
      { width: 800, height: 800 }
    );
    expect(finding.category).toBe(FindingCategory.Layout);
    expect(finding.sourceValue).toBe("800×600");
    expect(finding.supplierValue).toBe("800×800");
  });

  it("returns major severity for large ratio difference", () => {
    const finding = aspectRatioToFinding(
      "test_insp",
      0.25,
      { width: 800, height: 600 },
      { width: 800, height: 1000 }
    );
    expect(finding.severity).toBe(FindingSeverity.Major);
  });

  it("returns minor severity for small ratio difference", () => {
    const finding = aspectRatioToFinding(
      "test_insp",
      0.05,
      { width: 800, height: 600 },
      { width: 810, height: 600 }
    );
    expect(finding.severity).toBe(FindingSeverity.Minor);
  });
});
