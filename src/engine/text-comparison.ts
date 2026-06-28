import { Finding } from "@/domain/models";
import {
  ExtractedText,
  TextDiff,
  FileMetadata,
  MetadataDiff,
} from "@/domain/comparison-engine";
import {
  normalizeText,
  normalizeForComparison,
  splitLines,
  normalizedEditDistance,
} from "./text-normalization";
import {
  classifyTextMismatch,
  classifyPageCountMismatch,
  classifyDimensionMismatch,
} from "./severity-mapping";

/**
 * Compares extracted text from master and supplier documents.
 * Returns structured TextDiff results for each detected difference.
 */
export function compareExtractedText(
  master: ExtractedText,
  supplier: ExtractedText
): TextDiff[] {
  const diffs: TextDiff[] = [];
  const maxPages = Math.max(master.pages.length, supplier.pages.length);

  for (let i = 0; i < maxPages; i++) {
    const masterPage = master.pages[i];
    const supplierPage = supplier.pages[i];

    if (!masterPage && supplierPage) {
      diffs.push({
        pageNumber: i + 1,
        masterText: "",
        supplierText: normalizeText(supplierPage.content),
        location: `Page ${i + 1} (extra page in supplier)`,
        confidence: 1.0,
      });
      continue;
    }

    if (masterPage && !supplierPage) {
      diffs.push({
        pageNumber: i + 1,
        masterText: normalizeText(masterPage.content),
        supplierText: "",
        location: `Page ${i + 1} (missing in supplier)`,
        confidence: 1.0,
      });
      continue;
    }

    if (!masterPage || !supplierPage) continue;

    const masterLines = splitLines(normalizeText(masterPage.content));
    const supplierLines = splitLines(normalizeText(supplierPage.content));

    // Line-by-line comparison
    const maxLines = Math.max(masterLines.length, supplierLines.length);
    for (let j = 0; j < maxLines; j++) {
      const mLine = masterLines[j] ?? "";
      const sLine = supplierLines[j] ?? "";

      if (normalizeForComparison(mLine) !== normalizeForComparison(sLine)) {
        const distance = normalizedEditDistance(
          normalizeForComparison(mLine),
          normalizeForComparison(sLine)
        );

        if (distance > 0.01) {
          diffs.push({
            pageNumber: i + 1,
            masterText: mLine,
            supplierText: sLine,
            location: `Page ${i + 1}, line ${j + 1}`,
            confidence: Math.max(0.5, 1 - distance * 0.5),
          });
        }
      }
    }
  }

  return diffs;
}

/**
 * Compares document metadata and detects structural mismatches.
 */
export function compareMetadata(
  master: FileMetadata,
  supplier: FileMetadata
): MetadataDiff[] {
  const diffs: MetadataDiff[] = [];

  if (master.pageCount !== supplier.pageCount) {
    diffs.push({
      field: "pageCount",
      masterValue: String(master.pageCount),
      supplierValue: String(supplier.pageCount),
    });
  }

  if (master.mimeType !== supplier.mimeType) {
    diffs.push({
      field: "mimeType",
      masterValue: master.mimeType,
      supplierValue: supplier.mimeType,
    });
  }

  return diffs;
}

/**
 * Detects aspect ratio mismatch between master and supplier image dimensions.
 */
export function detectAspectRatioMismatch(
  masterWidth: number,
  masterHeight: number,
  supplierWidth: number,
  supplierHeight: number
): { hasMismatch: boolean; ratioDifference: number } {
  if (masterWidth === 0 || masterHeight === 0 || supplierWidth === 0 || supplierHeight === 0) {
    return { hasMismatch: false, ratioDifference: 0 };
  }

  const masterRatio = masterWidth / masterHeight;
  const supplierRatio = supplierWidth / supplierHeight;
  const ratioDifference = Math.abs(masterRatio - supplierRatio);

  return {
    hasMismatch: ratioDifference > 0.02,
    ratioDifference,
  };
}

/**
 * Converts TextDiff results into structured Finding objects.
 */
export function textDiffsToFindings(
  diffs: TextDiff[],
  inspectionId: string
): Finding[] {
  return diffs.map((diff, i) => {
    const editDist = normalizedEditDistance(
      normalizeForComparison(diff.masterText),
      normalizeForComparison(diff.supplierText)
    );

    const classification = classifyTextMismatch(
      diff.location,
      diff.masterText,
      diff.supplierText || null,
      editDist
    );

    return {
      id: `find_engine_${inspectionId}_${i}`,
      inspectionId,
      severity: classification.severity,
      category: classification.category,
      title: generateFindingTitle(diff, classification.isPotentialMismatch),
      description: generateFindingDescription(diff, classification),
      sourceValue: diff.masterText || null,
      supplierValue: diff.supplierText || null,
      location: diff.location,
      pageNumber: diff.pageNumber,
      confidence: classification.confidence,
      evidenceRegion: null,
      reviewerVerified: null,
    };
  });
}

/**
 * Converts metadata diffs into structured Finding objects.
 */
export function metadataDiffsToFindings(
  diffs: MetadataDiff[],
  inspectionId: string
): Finding[] {
  return diffs.map((diff, i) => {
    const isPageCount = diff.field === "pageCount";
    const classification = isPageCount
      ? classifyPageCountMismatch()
      : classifyDimensionMismatch(0.1);

    return {
      id: `find_meta_${inspectionId}_${i}`,
      inspectionId,
      severity: classification.severity,
      category: classification.category,
      title: isPageCount
        ? "Page count mismatch"
        : `Document ${diff.field} mismatch`,
      description: isPageCount
        ? `Master has ${diff.masterValue} pages but supplier has ${diff.supplierValue} pages. This may indicate missing or extra content.`
        : `Document ${diff.field} differs: master is "${diff.masterValue}", supplier is "${diff.supplierValue}".`,
      sourceValue: diff.masterValue,
      supplierValue: diff.supplierValue,
      location: "Document structure",
      pageNumber: 1,
      confidence: classification.confidence,
      evidenceRegion: null,
      reviewerVerified: null,
    };
  });
}

/**
 * Converts an aspect ratio mismatch into a Finding.
 */
export function aspectRatioToFinding(
  inspectionId: string,
  ratioDifference: number,
  masterDims: { width: number; height: number },
  supplierDims: { width: number; height: number }
): Finding {
  const classification = classifyDimensionMismatch(ratioDifference);

  return {
    id: `find_ratio_${inspectionId}`,
    inspectionId,
    severity: classification.severity,
    category: classification.category,
    title: "Dimension / aspect ratio mismatch",
    description: `Master dimensions (${masterDims.width}×${masterDims.height}) have a different aspect ratio than supplier (${supplierDims.width}×${supplierDims.height}). ${classification.isPotentialMismatch ? "Potential mismatch — requires visual verification." : "Significant layout difference detected."}`,
    sourceValue: `${masterDims.width}×${masterDims.height}`,
    supplierValue: `${supplierDims.width}×${supplierDims.height}`,
    location: "Full document",
    pageNumber: 1,
    confidence: classification.confidence,
    evidenceRegion: null,
    reviewerVerified: null,
  };
}

function generateFindingTitle(diff: TextDiff, isPotential: boolean): string {
  const prefix = isPotential ? "Potential mismatch" : "Text mismatch";

  if (!diff.supplierText) {
    return `Missing content at ${diff.location}`;
  }
  if (!diff.masterText) {
    return `Extra content at ${diff.location}`;
  }
  return `${prefix} at ${diff.location}`;
}

function generateFindingDescription(
  diff: TextDiff,
  classification: { isPotentialMismatch: boolean; confidence: number }
): string {
  const parts: string[] = [];

  if (!diff.supplierText) {
    parts.push(
      `Content present in the approved master is missing from the supplier proof.`
    );
  } else if (!diff.masterText) {
    parts.push(
      `Content found in the supplier proof is not present in the approved master.`
    );
  } else {
    parts.push(
      `Text content differs between the approved master and the supplier proof.`
    );
  }

  if (classification.isPotentialMismatch) {
    parts.push(
      `Confidence: ${Math.round(classification.confidence * 100)}%. Flagged as potential mismatch — human verification recommended.`
    );
  }

  return parts.join(" ");
}
