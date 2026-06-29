export const INSPECTION_PROFILE_SUMMARY = {
  id: "profile_medical_device_01",
  name: "Medical Device Packaging",
  sensitivity: "Strict",
  enabledChecks: [
    "Text content verification",
    "Barcode / QR validation",
    "Required symbols check",
    "Layout and positioning",
    "Typography and font weight",
    "Revision / SKU metadata",
    "Missing elements detection",
  ],
  referenceFields: [
    { label: "SKU", value: "BT-SCK-240" },
    { label: "Revision", value: "REV-04" },
    { label: "Barcode", value: "8421-9940-22" },
    { label: "Storage", value: "Store at 2–8°C" },
    { label: "Warning", value: "For professional use only" },
    { label: "LOT field", value: "Required" },
    { label: "EXP field", value: "Required" },
  ],
};

export function getProfileSummary(profileRef: string | null) {
  if (profileRef === "profile_medical_device_01") {
    return INSPECTION_PROFILE_SUMMARY;
  }
  return null;
}
