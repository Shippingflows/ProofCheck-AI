import { Inspection, Finding, AuditEvent } from "@/domain/models";
import {
  InspectionStatus,
  FindingSeverity,
  FindingCategory,
  ReviewDecision,
  AuditAction,
  CorrectionStatus,
  AuditActorRole,
  AuditEventSource,
} from "@/domain/enums";
import { RECOMMENDATION_REJECT } from "@/lib/recommendations";
import { DEFAULT_CHECKLIST_COMPLETED } from "@/lib/reviewer-checklist";
import { EVIDENCE_SNAPSHOTS } from "@/lib/evidence-snapshots";

export const DEMO_INSPECTION_ID = "insp_bioTouch_001";
export const DEMO_DEFAULT_FINDING_ID = "find_001";
export const DEMO_FORM_TITLE =
  "BioTouch Sample Collection Kit — Supplier Proof Review";
export const DEMO_SUPPLIER_EMAIL =
  "Pacific Print Solutions <qa@pacificprintsolutions.example>";

function auditEvent(
  partial: Omit<AuditEvent, "eventId" | "actorRole" | "source" | "timestampLocal"> & {
    actorRole?: AuditActorRole;
    source?: AuditEventSource;
    timestampLocal?: string;
  }
): AuditEvent {
  const isSystem = partial.actor === "System";
  return {
    eventId: partial.id.toUpperCase().replace("AUDIT", "EVT"),
    actorRole: partial.actorRole ?? (isSystem ? AuditActorRole.System : AuditActorRole.QualityReviewer),
    source: partial.source ?? (isSystem ? AuditEventSource.System : AuditEventSource.Reviewer),
    timestampLocal: partial.timestampLocal ?? "Jan 15, 2025, 9:30 AM EST",
    ...partial,
  };
}

function finding(
  data: Omit<
    Finding,
    "detectionMethod" | "recommendedAction" | "masterEvidenceSrc" | "supplierEvidenceSrc"
  >
): Finding {
  const snaps = EVIDENCE_SNAPSHOTS[data.id];
  return {
    ...data,
    detectionMethod: "OCR text comparison",
    recommendedAction:
      data.severity === FindingSeverity.Critical
        ? "Supplier correction required"
        : data.severity === FindingSeverity.Major
          ? "Review and request correction if confirmed"
          : "Reviewer confirmation recommended",
    masterEvidenceSrc: snaps?.master ?? null,
    supplierEvidenceSrc: snaps?.supplier ?? null,
  };
}

const baseInspection = {
  reviewerEmail: "sarah.chen@demo-company.com",
  reviewerRole: "Quality Reviewer",
  checklistIds: ["chk_text", "chk_barcode", "chk_symbols", "chk_metadata", "chk_missing"],
  recommendationNote: "Final disposition requires confirmation by an authorized QA reviewer.",
  masterFileHash: "demo-b94d27b9c4e8f1a2037d6e5b4a2910c8f7e6d5c4b3a291807f6e5d4c3b2a1908f7",
  supplierFileHash: "demo-a81f5f3c7e6d5c4b3a291807f6e5d4c3b2a1908f7e6d5c4b3a291807f6e5",
  masterUploadedAt: "2025-01-15T09:32:00Z",
  supplierUploadedAt: "2025-01-15T09:34:00Z",
  checklistCompleted: { ...DEFAULT_CHECKLIST_COMPLETED },
};

export const seedInspections: Inspection[] = [
  {
    ...baseInspection,
    id: DEMO_INSPECTION_ID,
    title: DEMO_FORM_TITLE,
    sku: "BT-SCK-240",
    revision: "REV-04",
    supplierName: "Pacific Print Solutions",
    status: InspectionStatus.PendingReview,
    decision: ReviewDecision.Pending,
    createdAt: "2025-01-15T09:30:00Z",
    updatedAt: "2025-01-15T10:12:00Z",
    dueDate: "2025-01-22T17:00:00Z",
    reviewerName: "Sarah Chen",
    masterFileRef: "files/master/bt-sck-240-rev04-approved.pdf",
    supplierFileRef: "files/supplier/bt-sck-240-supplier-proof-v1.pdf",
    profileRef: "profile_medical_device_01",
    findingsCount: { critical: 4, major: 3, minor: 3 },
    recommendation: RECOMMENDATION_REJECT,
    correctionStatus: CorrectionStatus.DraftPrepared,
  },
  {
    ...baseInspection,
    id: "insp_pharma_002",
    title: "PharmaClear Vial Label — Print Proof Review",
    sku: "PC-VL-110",
    revision: "REV-07",
    supplierName: "Apex Medical Print",
    status: InspectionStatus.ApprovedWithNotes,
    decision: ReviewDecision.Approved,
    createdAt: "2025-01-12T14:00:00Z",
    updatedAt: "2025-01-12T16:45:00Z",
    dueDate: "2025-01-19T17:00:00Z",
    reviewerName: "Marcus Webb",
    reviewerEmail: "marcus.webb@demo-company.com",
    masterFileRef: "files/master/pc-vl-110-rev07-approved.pdf",
    supplierFileRef: "files/supplier/pc-vl-110-supplier-proof.pdf",
    profileRef: "profile_pharma_label_01",
    findingsCount: { critical: 0, major: 1, minor: 2 },
    recommendation: null,
    correctionStatus: CorrectionStatus.Closed,
    masterFileHash: "demo-c12a45f9e8d7c6b5a4938271605f4e3d2c1b0a9f8e7d6c5b4a39281706f5e4d3",
    supplierFileHash: "demo-d23b56a0f9e8d7c6b5a4938271605f4e3d2c1b0a9f8e7d6c5b4a39281706",
  },
  {
    ...baseInspection,
    id: "insp_nutri_003",
    title: "NutriBlend Protein Bar Wrapper — Allergen Claim Review",
    sku: "NB-PB-500",
    revision: "REV-B",
    supplierName: "LabelWorks Midwest",
    status: InspectionStatus.Rejected,
    decision: ReviewDecision.CorrectionRequired,
    createdAt: "2025-01-10T11:20:00Z",
    updatedAt: "2025-01-11T09:00:00Z",
    dueDate: "2025-01-17T17:00:00Z",
    reviewerName: "Sarah Chen",
    masterFileRef: "files/master/nb-pb-500-revb-approved.pdf",
    supplierFileRef: "files/supplier/nb-pb-500-supplier-v2.pdf",
    profileRef: "profile_food_packaging_01",
    findingsCount: { critical: 2, major: 4, minor: 1 },
    recommendation: RECOMMENDATION_REJECT,
    correctionStatus: CorrectionStatus.AwaitingResubmission,
  },
  {
    ...baseInspection,
    id: "insp_med_004",
    title: "MediSafe Syringe Blister — Compliance Check",
    sku: "MS-SB-320",
    revision: "REV-C",
    supplierName: "Sterling Packaging",
    status: InspectionStatus.Draft,
    decision: ReviewDecision.Pending,
    createdAt: "2025-01-16T08:00:00Z",
    updatedAt: "2025-01-16T08:00:00Z",
    dueDate: null,
    reviewerName: "Marcus Webb",
    reviewerEmail: "marcus.webb@demo-company.com",
    masterFileRef: "",
    supplierFileRef: "",
    profileRef: null,
    checklistIds: [],
    findingsCount: { critical: 0, major: 0, minor: 0 },
    recommendation: null,
    correctionStatus: CorrectionStatus.NotStarted,
    masterFileHash: null,
    supplierFileHash: null,
    masterUploadedAt: null,
    supplierUploadedAt: null,
  },
];

export const seedFindings: Finding[] = [
  finding({
    id: "find_001",
    inspectionId: DEMO_INSPECTION_ID,
    severity: FindingSeverity.Critical,
    category: FindingCategory.Metadata,
    title: "Revision number mismatch",
    description:
      "Document revision identifier changed from approved value. This could indicate the supplier used an outdated source file.",
    sourceValue: "REV-04",
    supplierValue: "REV-03",
    location: "Header area, top-right",
    pageNumber: 1,
    confidence: 0.98,
    evidenceRegion: { x: 418, y: 42, width: 74, height: 20, pageNumber: 1 },
    reviewerVerified: null,
  }),
  finding({
    id: "find_002",
    inspectionId: DEMO_INSPECTION_ID,
    severity: FindingSeverity.Critical,
    category: FindingCategory.Barcode,
    title: "Barcode value discrepancy",
    description:
      "Barcode numeric sequence differs from approved master. A single digit transposition was detected which would cause scanning failures.",
    sourceValue: "8421-9940-22",
    supplierValue: "8421-9040-22",
    location: "Reference code, barcode region",
    pageNumber: 1,
    confidence: 0.99,
    evidenceRegion: { x: 38, y: 472, width: 226, height: 92, pageNumber: 1 },
    reviewerVerified: null,
  }),
  finding({
    id: "find_003",
    inspectionId: DEMO_INSPECTION_ID,
    severity: FindingSeverity.Critical,
    category: FindingCategory.MissingElement,
    title: "LOT field missing",
    description:
      "Required lot number field (LOT: ______) is not present on the supplier proof. This field is mandatory for traceability.",
    sourceValue: "LOT: ______",
    supplierValue: null,
    location: "Product information panel, Lot No. row",
    pageNumber: 1,
    confidence: 0.96,
    evidenceRegion: { x: 30, y: 384, width: 260, height: 24, pageNumber: 1 },
    reviewerVerified: null,
  }),
  finding({
    id: "find_004",
    inspectionId: DEMO_INSPECTION_ID,
    severity: FindingSeverity.Critical,
    category: FindingCategory.TextContent,
    title: "Storage temperature range altered",
    description:
      "Storage condition upper bound changed. This could affect product safety and regulatory compliance.",
    sourceValue: "Store at 2–8°C",
    supplierValue: "Store at 2–6°C",
    location: "Product information panel, Storage row",
    pageNumber: 1,
    confidence: 0.97,
    evidenceRegion: { x: 30, y: 316, width: 300, height: 24, pageNumber: 1 },
    reviewerVerified: null,
  }),
  finding({
    id: "find_005",
    inspectionId: DEMO_INSPECTION_ID,
    severity: FindingSeverity.Major,
    category: FindingCategory.TextContent,
    title: "Warning text truncated",
    description:
      'Professional use warning is incomplete — missing the word "only" which alters the regulatory meaning of the statement.',
    sourceValue: "For professional use only",
    supplierValue: "For professional use",
    location: "Product information panel, Warning row",
    pageNumber: 1,
    confidence: 0.95,
    evidenceRegion: { x: 30, y: 350, width: 340, height: 24, pageNumber: 1 },
    reviewerVerified: null,
  }),
  finding({
    id: "find_006",
    inspectionId: DEMO_INSPECTION_ID,
    severity: FindingSeverity.Major,
    category: FindingCategory.TextContent,
    title: "Product name misspelling",
    description:
      '"Collection" is misspelled as "Collecton" in the product title. This is a typographical error that affects brand presentation.',
    sourceValue: "Collection",
    supplierValue: "Collecton",
    location: "Product title, front panel",
    pageNumber: 1,
    confidence: 0.99,
    evidenceRegion: { x: 116, y: 100, width: 122, height: 26, pageNumber: 1 },
    reviewerVerified: null,
  }),
  finding({
    id: "find_007",
    inspectionId: DEMO_INSPECTION_ID,
    severity: FindingSeverity.Major,
    category: FindingCategory.Symbol,
    title: "Required sterile symbol missing",
    description:
      "The mandatory sterile symbol is not present on the supplier proof. This symbol is required for medical device packaging.",
    sourceValue: "Sterile symbol present",
    supplierValue: null,
    location: "Packaging symbols row, first cell",
    pageNumber: 1,
    confidence: 0.92,
    evidenceRegion: { x: 38, y: 188, width: 84, height: 64, pageNumber: 1 },
    reviewerVerified: null,
  }),
  finding({
    id: "find_008",
    inspectionId: DEMO_INSPECTION_ID,
    severity: FindingSeverity.Minor,
    category: FindingCategory.Layout,
    title: "Logo position shifted",
    description:
      "Company logo appears shifted approximately 4mm to the right compared to the approved master.",
    sourceValue: "Logo anchored at x:24",
    supplierValue: "Logo positioned at x:36",
    location: "Header, logo area",
    pageNumber: 1,
    confidence: 0.78,
    evidenceRegion: { x: 18, y: 16, width: 64, height: 46, pageNumber: 1 },
    reviewerVerified: null,
  }),
  finding({
    id: "find_009",
    inspectionId: DEMO_INSPECTION_ID,
    severity: FindingSeverity.Minor,
    category: FindingCategory.Color,
    title: "Visual brand blue variance",
    description:
      "Visual variance detected in the primary brand blue. The supplier proof appears slightly more saturated than the approved master.",
    sourceValue: "Brand blue (reference)",
    supplierValue: "Visual variance detected",
    location: "Header background band",
    pageNumber: 1,
    confidence: 0.72,
    evidenceRegion: { x: 0, y: 0, width: 500, height: 72, pageNumber: 1 },
    reviewerVerified: null,
  }),
  finding({
    id: "find_010",
    inspectionId: DEMO_INSPECTION_ID,
    severity: FindingSeverity.Minor,
    category: FindingCategory.Typography,
    title: "SKU font weight changed",
    description:
      "The SKU identifier appears to use a medium font weight instead of the approved regular weight.",
    sourceValue: "Regular (400)",
    supplierValue: "Medium (500)",
    location: "Header, SKU label area",
    pageNumber: 1,
    confidence: 0.68,
    evidenceRegion: { x: 372, y: 18, width: 120, height: 20, pageNumber: 1 },
    reviewerVerified: null,
  }),
];

export const seedAuditEvents: AuditEvent[] = [
  auditEvent({
    id: "audit_001",
    inspectionId: DEMO_INSPECTION_ID,
    action: AuditAction.InspectionCreated,
    actor: "Sarah Chen",
    timestamp: "2025-01-15T09:30:00Z",
    timestampLocal: "Jan 15, 2025, 9:30 AM EST",
    metadata: { title: DEMO_FORM_TITLE },
  }),
  auditEvent({
    id: "audit_002",
    inspectionId: DEMO_INSPECTION_ID,
    action: AuditAction.MasterFileUploaded,
    actor: "Sarah Chen",
    timestamp: "2025-01-15T09:32:00Z",
    timestampLocal: "Jan 15, 2025, 9:32 AM EST",
    metadata: {
      fileName: "bt-sck-240-rev04-approved.pdf",
      sha256: "demo-b94d27b9...",
    },
  }),
  auditEvent({
    id: "audit_003",
    inspectionId: DEMO_INSPECTION_ID,
    action: AuditAction.SupplierFileUploaded,
    actor: "Sarah Chen",
    timestamp: "2025-01-15T09:34:00Z",
    timestampLocal: "Jan 15, 2025, 9:34 AM EST",
    metadata: {
      fileName: "bt-sck-240-supplier-proof-v1.pdf",
      sha256: "demo-a81f5f3c...",
    },
  }),
  auditEvent({
    id: "audit_004",
    inspectionId: DEMO_INSPECTION_ID,
    action: AuditAction.ComparisonStarted,
    actor: "System",
    timestamp: "2025-01-15T09:35:00Z",
    timestampLocal: "Jan 15, 2025, 9:35 AM EST",
    metadata: { engine: "deterministic_v1" },
  }),
  auditEvent({
    id: "audit_005",
    inspectionId: DEMO_INSPECTION_ID,
    action: AuditAction.ComparisonCompleted,
    actor: "System",
    timestamp: "2025-01-15T10:10:00Z",
    timestampLocal: "Jan 15, 2025, 10:10 AM EST",
    metadata: { duration: "35 minutes", pagesProcessed: "1" },
  }),
  auditEvent({
    id: "audit_006",
    inspectionId: DEMO_INSPECTION_ID,
    action: AuditAction.FindingsGenerated,
    actor: "System",
    timestamp: "2025-01-15T10:12:00Z",
    timestampLocal: "Jan 15, 2025, 10:12 AM EST",
    metadata: { totalFindings: "10", critical: "4", major: "3", minor: "3" },
  }),
  auditEvent({
    id: "audit_007",
    inspectionId: "insp_pharma_002",
    action: AuditAction.DecisionMade,
    actor: "Marcus Webb",
    timestamp: "2025-01-12T16:45:00Z",
    timestampLocal: "Jan 12, 2025, 4:45 PM EST",
    metadata: { decision: "approved_with_notes" },
  }),
  auditEvent({
    id: "audit_008",
    inspectionId: "insp_nutri_003",
    action: AuditAction.DecisionMade,
    actor: "Sarah Chen",
    timestamp: "2025-01-11T09:00:00Z",
    timestampLocal: "Jan 11, 2025, 9:00 AM EST",
    metadata: { decision: "correction_required" },
  }),
];

export function isDemoFormSubmission(title: string, supplierName: string): boolean {
  return title === DEMO_FORM_TITLE && supplierName === "Pacific Print Solutions";
}
