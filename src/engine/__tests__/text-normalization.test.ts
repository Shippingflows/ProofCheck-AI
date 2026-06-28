import { describe, it, expect } from "vitest";
import {
  normalizeText,
  normalizeForComparison,
  splitLines,
  tokenSimilarity,
  isWhitespaceOnlyDifference,
  extractKeyValuePairs,
  editDistance,
  normalizedEditDistance,
} from "../text-normalization";

describe("normalizeText", () => {
  it("collapses multiple spaces", () => {
    expect(normalizeText("hello   world")).toBe("hello world");
  });

  it("replaces smart quotes", () => {
    expect(normalizeText("\u201CHello\u201D")).toBe('"Hello"');
    expect(normalizeText("it\u2019s")).toBe("it's");
    expect(normalizeText("\u2018quoted\u2019")).toBe("'quoted'");
  });

  it("normalizes non-breaking spaces", () => {
    expect(normalizeText("foo\u00A0bar")).toBe("foo bar");
  });

  it("trims whitespace", () => {
    expect(normalizeText("  hello  ")).toBe("hello");
  });

  it("preserves en-dash and em-dash", () => {
    expect(normalizeText("\u2013")).toBe("–");
    expect(normalizeText("\u2014")).toBe("—");
  });

  it("normalizes CRLF to LF", () => {
    expect(normalizeText("a\r\nb")).toBe("a\nb");
  });

  it("replaces tabs with spaces", () => {
    expect(normalizeText("a\tb")).toBe("a b");
  });
});

describe("normalizeForComparison", () => {
  it("lowercases and normalizes", () => {
    expect(normalizeForComparison("Hello  World")).toBe("hello world");
  });
});

describe("splitLines", () => {
  it("splits text into non-empty trimmed lines", () => {
    expect(splitLines("a\n  \nb\n  c  ")).toEqual(["a", "b", "c"]);
  });

  it("returns empty array for empty string", () => {
    expect(splitLines("")).toEqual([]);
  });
});

describe("tokenSimilarity", () => {
  it("returns 1 for identical strings", () => {
    expect(tokenSimilarity("hello world", "hello world")).toBe(1);
  });

  it("returns 0 for completely different strings", () => {
    expect(tokenSimilarity("foo bar", "baz qux")).toBe(0);
  });

  it("returns partial similarity for overlapping tokens", () => {
    const sim = tokenSimilarity("hello world foo", "hello world bar");
    expect(sim).toBeCloseTo(0.5, 1);
  });

  it("returns 1 for two empty strings", () => {
    expect(tokenSimilarity("", "")).toBe(1);
  });

  it("returns 0 when one string is empty", () => {
    expect(tokenSimilarity("hello", "")).toBe(0);
  });
});

describe("isWhitespaceOnlyDifference", () => {
  it("returns true for same content with different casing", () => {
    expect(isWhitespaceOnlyDifference("Hello", "hello")).toBe(true);
  });

  it("returns true for same content with extra spaces", () => {
    expect(isWhitespaceOnlyDifference("a  b", "a b")).toBe(true);
  });

  it("returns false for different content", () => {
    expect(isWhitespaceOnlyDifference("hello", "world")).toBe(false);
  });
});

describe("extractKeyValuePairs", () => {
  it("extracts key-value pairs from structured text", () => {
    const text = "SKU: BT-SCK-240\nRevision: REV-04\nBarcode: 8421-9940-22";
    const pairs = extractKeyValuePairs(text);
    expect(pairs.get("sku")).toBe("BT-SCK-240");
    expect(pairs.get("revision")).toBe("REV-04");
    expect(pairs.get("barcode")).toBe("8421-9940-22");
  });

  it("handles lines without colons", () => {
    const text = "No colon here\nSKU: valid";
    const pairs = extractKeyValuePairs(text);
    expect(pairs.size).toBe(1);
    expect(pairs.get("sku")).toBe("valid");
  });

  it("handles empty values", () => {
    const text = "Key:";
    const pairs = extractKeyValuePairs(text);
    expect(pairs.size).toBe(0);
  });
});

describe("editDistance", () => {
  it("returns 0 for identical strings", () => {
    expect(editDistance("hello", "hello")).toBe(0);
  });

  it("returns correct distance for single char difference", () => {
    expect(editDistance("cat", "bat")).toBe(1);
  });

  it("handles empty strings", () => {
    expect(editDistance("", "abc")).toBe(3);
    expect(editDistance("abc", "")).toBe(3);
  });

  it("computes correct distance for transposition", () => {
    expect(editDistance("8421-9940-22", "8421-9040-22")).toBe(1);
  });

  it("computes correct distance for word differences", () => {
    expect(editDistance("Collection", "Collecton")).toBe(1);
  });
});

describe("normalizedEditDistance", () => {
  it("returns 0 for identical strings", () => {
    expect(normalizedEditDistance("hello", "hello")).toBe(0);
  });

  it("returns 1 for completely different strings of same length", () => {
    expect(normalizedEditDistance("abc", "xyz")).toBe(1);
  });

  it("returns value between 0 and 1", () => {
    const dist = normalizedEditDistance("hello", "hallo");
    expect(dist).toBeGreaterThan(0);
    expect(dist).toBeLessThan(1);
  });

  it("returns 0 for two empty strings", () => {
    expect(normalizedEditDistance("", "")).toBe(0);
  });
});
