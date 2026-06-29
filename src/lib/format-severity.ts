export function formatSeverityCounts(counts: {
  critical: number;
  major: number;
  minor: number;
}): string {
  const parts: string[] = [];
  if (counts.critical > 0) {
    parts.push(`${counts.critical} Critical`);
  }
  if (counts.major > 0) {
    parts.push(`${counts.major} Major`);
  }
  if (counts.minor > 0) {
    parts.push(`${counts.minor} Minor`);
  }
  return parts.length > 0 ? parts.join(" · ") : "No findings";
}
