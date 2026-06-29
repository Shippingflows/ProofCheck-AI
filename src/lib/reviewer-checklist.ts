export const REVIEWER_CHECKLIST_ITEMS = [
  { id: "chk_master", label: "Approved master loaded" },
  { id: "chk_supplier", label: "Supplier proof loaded" },
  { id: "chk_profile", label: "Inspection profile selected" },
  { id: "chk_text", label: "Text differences reviewed" },
  { id: "chk_barcode", label: "Barcode value checked" },
  { id: "chk_symbols", label: "Required symbols checked" },
  { id: "chk_revision", label: "Revision and SKU checked" },
  { id: "chk_critical", label: "Critical findings confirmed" },
  { id: "chk_correction", label: "Supplier correction sent" },
  { id: "chk_decision", label: "Final decision recorded" },
] as const;

export const DEFAULT_CHECKLIST_COMPLETED: Record<string, boolean> = {
  chk_master: true,
  chk_supplier: true,
  chk_profile: true,
  chk_text: true,
  chk_barcode: true,
  chk_symbols: true,
  chk_revision: true,
  chk_critical: false,
  chk_correction: false,
  chk_decision: false,
};
