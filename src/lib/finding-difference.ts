import { Finding } from "@/domain/models";
import { FindingCategory } from "@/domain/enums";

/** Plain-language difference summary for the finding detail panel. */
export function getDifferenceNote(finding: Finding): string {
  if (finding.id === "find_001") {
    return "Supplier proof appears to use older revision";
  }

  const missing =
    finding.supplierValue === null || finding.supplierValue.trim() === "";

  if (missing) {
    return "Required value missing from supplier proof";
  }

  switch (finding.category) {
    case FindingCategory.Barcode:
      return "Decoded barcode value does not match approved master";
    case FindingCategory.Metadata:
      return "Document metadata differs from approved master";
    case FindingCategory.Symbol:
      return "Regulatory symbol does not match approved master";
    case FindingCategory.TextContent:
      return "Text content differs from approved master";
    case FindingCategory.MissingElement:
      return "Expected element not detected on supplier proof";
    default:
      return `Supplier value "${finding.supplierValue}" differs from approved "${finding.sourceValue ?? "—"}"`;
  }
}
