import { Finding } from "@/domain/models";

interface OtherFindingsBannerProps {
  findings: Finding[];
  selectedFindingId: string | null;
}

export function OtherFindingsBanner({
  findings,
  selectedFindingId,
}: OtherFindingsBannerProps) {
  const otherCount = findings.filter((f) => f.id !== selectedFindingId).length;
  if (otherCount === 0) return null;

  const selectedIndex = findings.findIndex((f) => f.id === selectedFindingId);
  const selectedNum = selectedIndex >= 0 ? selectedIndex + 1 : null;

  return (
    <div className="shrink-0 border-b border-border bg-muted/30 px-4 py-1.5 text-[11px] text-muted-foreground">
      <span className="font-medium text-foreground">{findings.length} findings detected</span>
      {selectedNum != null && (
        <>
          {" "}
          · <span className="font-medium text-foreground">#{selectedNum} selected</span>
        </>
      )}
      {" "}
      · {otherCount} other{otherCount === 1 ? "" : "s"} marked with numbered
      indicators on the proof and listed in the Findings panel
    </div>
  );
}
