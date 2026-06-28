import { FindingSeverity, FindingCategory } from "@/domain/enums";

export interface MismatchClassification {
  severity: FindingSeverity;
  category: FindingCategory;
  confidence: number;
  isPotentialMismatch: boolean;
}

/**
 * Maps a text mismatch to a severity based on content patterns.
 * Uses deterministic rules — no LLM.
 */
export function classifyTextMismatch(
  field: string,
  masterValue: string,
  supplierValue: string | null,
  editDistanceRatio: number
): MismatchClassification {
  const fieldLower = field.toLowerCase();

  // Missing value is always critical
  if (supplierValue === null || supplierValue.trim() === "") {
    return {
      severity: FindingSeverity.Critical,
      category: categorizeField(fieldLower),
      confidence: 0.95,
      isPotentialMismatch: false,
    };
  }

  // Barcode / SKU changes are critical
  if (
    fieldLower.includes("barcode") ||
    fieldLower.includes("upc") ||
    fieldLower.includes("ean") ||
    fieldLower.includes("gtin")
  ) {
    return {
      severity: FindingSeverity.Critical,
      category: FindingCategory.Barcode,
      confidence: 0.99,
      isPotentialMismatch: false,
    };
  }

  // Revision number changes are critical
  if (
    fieldLower.includes("revision") ||
    fieldLower.includes("rev") ||
    fieldLower.includes("version")
  ) {
    return {
      severity: FindingSeverity.Critical,
      category: FindingCategory.Metadata,
      confidence: 0.98,
      isPotentialMismatch: false,
    };
  }

  // Storage/temperature/dosage changes are critical (regulatory)
  if (
    fieldLower.includes("storage") ||
    fieldLower.includes("temperature") ||
    fieldLower.includes("dosage") ||
    fieldLower.includes("°c") ||
    fieldLower.includes("°f") ||
    masterValue.includes("°")
  ) {
    return {
      severity: FindingSeverity.Critical,
      category: FindingCategory.TextContent,
      confidence: 0.97,
      isPotentialMismatch: false,
    };
  }

  // LOT/EXP/batch fields missing are critical
  if (
    fieldLower.includes("lot") ||
    fieldLower.includes("exp") ||
    fieldLower.includes("batch")
  ) {
    return {
      severity: FindingSeverity.Critical,
      category: FindingCategory.MissingElement,
      confidence: 0.96,
      isPotentialMismatch: false,
    };
  }

  // Warning/caution text changes are major
  if (
    fieldLower.includes("warning") ||
    fieldLower.includes("caution") ||
    fieldLower.includes("danger")
  ) {
    return {
      severity: FindingSeverity.Major,
      category: FindingCategory.TextContent,
      confidence: 0.95,
      isPotentialMismatch: false,
    };
  }

  // Small edit distance = likely typo (major)
  if (editDistanceRatio > 0 && editDistanceRatio <= 0.15) {
    return {
      severity: FindingSeverity.Major,
      category: FindingCategory.TextContent,
      confidence: 0.92,
      isPotentialMismatch: false,
    };
  }

  // Medium edit distance = potential significant change
  if (editDistanceRatio > 0.15 && editDistanceRatio <= 0.4) {
    return {
      severity: FindingSeverity.Major,
      category: categorizeField(fieldLower),
      confidence: 0.85,
      isPotentialMismatch: true,
    };
  }

  // Large edit distance = minor or potential mismatch
  if (editDistanceRatio > 0.4) {
    return {
      severity: FindingSeverity.Minor,
      category: categorizeField(fieldLower),
      confidence: 0.70,
      isPotentialMismatch: true,
    };
  }

  return {
    severity: FindingSeverity.Minor,
    category: categorizeField(fieldLower),
    confidence: 0.75,
    isPotentialMismatch: true,
  };
}

/**
 * Classifies page count mismatches.
 */
export function classifyPageCountMismatch(): MismatchClassification {
  return {
    severity: FindingSeverity.Critical,
    category: FindingCategory.Metadata,
    confidence: 1.0,
    isPotentialMismatch: false,
  };
}

/**
 * Classifies dimension/aspect-ratio mismatches.
 */
export function classifyDimensionMismatch(
  ratioDifference: number
): MismatchClassification {
  if (ratioDifference > 0.1) {
    return {
      severity: FindingSeverity.Major,
      category: FindingCategory.Layout,
      confidence: 0.95,
      isPotentialMismatch: false,
    };
  }

  return {
    severity: FindingSeverity.Minor,
    category: FindingCategory.Layout,
    confidence: 0.80,
    isPotentialMismatch: true,
  };
}

function categorizeField(field: string): FindingCategory {
  if (field.includes("barcode") || field.includes("qr")) {
    return FindingCategory.Barcode;
  }
  if (field.includes("symbol") || field.includes("icon")) {
    return FindingCategory.Symbol;
  }
  if (field.includes("color") || field.includes("colour")) {
    return FindingCategory.Color;
  }
  if (field.includes("font") || field.includes("weight") || field.includes("typography")) {
    return FindingCategory.Typography;
  }
  if (field.includes("layout") || field.includes("position")) {
    return FindingCategory.Layout;
  }
  if (
    field.includes("revision") ||
    field.includes("sku") ||
    field.includes("version")
  ) {
    return FindingCategory.Metadata;
  }
  return FindingCategory.TextContent;
}
