/**
 * Text normalization utilities for deterministic comparison.
 * Strips noise while preserving semantically meaningful differences.
 */

export function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\u00A0/g, " ") // non-breaking space
    .replace(/[\u2018\u2019]/g, "'") // smart quotes
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2013/g, "–") // en-dash
    .replace(/\u2014/g, "—") // em-dash
    .replace(/ {2,}/g, " ")
    .trim();
}

export function normalizeForComparison(raw: string): string {
  return normalizeText(raw).toLowerCase();
}

/**
 * Splits text into meaningful lines, filtering out blanks.
 */
export function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/**
 * Computes a simple token-level similarity ratio (0–1).
 * Used to determine confidence for fuzzy matches.
 */
export function tokenSimilarity(a: string, b: string): number {
  const tokensA = a.toLowerCase().split(/\s+/);
  const tokensB = b.toLowerCase().split(/\s+/);

  if (tokensA.length === 0 && tokensB.length === 0) return 1;
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = new Set([...setA].filter((t) => setB.has(t)));
  const union = new Set([...setA, ...setB]);

  return intersection.size / union.size;
}

/**
 * Checks if two strings differ only by whitespace/case (non-semantic difference).
 */
export function isWhitespaceOnlyDifference(a: string, b: string): boolean {
  return normalizeForComparison(a) === normalizeForComparison(b);
}

/**
 * Extracts key-value pairs from structured text (e.g. "SKU: BT-SCK-240").
 */
export function extractKeyValuePairs(
  text: string
): Map<string, string> {
  const pairs = new Map<string, string>();
  const lines = splitLines(text);

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0 && colonIndex < line.length - 1) {
      const key = line.slice(0, colonIndex).trim().toLowerCase();
      const value = line.slice(colonIndex + 1).trim();
      if (key.length > 0 && value.length > 0) {
        pairs.set(key, value);
      }
    }
  }

  return pairs;
}

/**
 * Calculates Levenshtein edit distance between two strings.
 */
export function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}

/**
 * Returns normalized edit distance (0 = identical, 1 = completely different).
 */
export function normalizedEditDistance(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 0;
  return editDistance(a, b) / maxLen;
}
