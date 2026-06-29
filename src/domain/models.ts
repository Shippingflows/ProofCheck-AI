import {
  InspectionStatus,
  FindingSeverity,
  FindingCategory,
  ReviewDecision,
  AuditAction,
  CorrectionStatus,
  AuditActorRole,
  AuditEventSource,
} from "./enums";

export interface Inspection {
  id: string;
  title: string;
  sku: string;
  revision: string;
  supplierName: string;
  status: InspectionStatus;
  decision: ReviewDecision;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  reviewerName: string;
  reviewerEmail: string;
  reviewerRole: string;
  masterFileRef: string;
  supplierFileRef: string;
  profileRef: string | null;
  checklistIds: string[];
  findingsCount: {
    critical: number;
    major: number;
    minor: number;
  };
  recommendation: string | null;
  recommendationNote: string | null;
  correctionStatus: CorrectionStatus;
  masterFileHash: string | null;
  supplierFileHash: string | null;
  masterUploadedAt: string | null;
  supplierUploadedAt: string | null;
  checklistCompleted: Record<string, boolean>;
}

export interface FileLineageEntry {
  role: "master" | "supplier";
  fileName: string;
  revision: string;
  version: string;
  versionLocked: boolean;
  uploadedBy: string;
  uploadedAt: string;
  sha256: string;
}

export interface FindingComment {
  id: string;
  findingId: string;
  author: string;
  authorRole: string;
  body: string;
  timestamp: string;
  mentionSupplier: boolean;
}

export interface Finding {
  id: string;
  inspectionId: string;
  severity: FindingSeverity;
  category: FindingCategory;
  title: string;
  description: string;
  sourceValue: string | null;
  supplierValue: string | null;
  location: string;
  pageNumber: number;
  confidence: number;
  evidenceRegion: EvidenceRegion | null;
  reviewerVerified: boolean | null;
  detectionMethod: string;
  recommendedAction: string;
  masterEvidenceSrc: string | null;
  supplierEvidenceSrc: string | null;
}

export interface EvidenceRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
}

export interface AuditEvent {
  id: string;
  eventId: string;
  inspectionId: string;
  action: AuditAction;
  actor: string;
  actorRole: AuditActorRole;
  source: AuditEventSource;
  timestamp: string;
  timestampLocal: string;
  metadata: Record<string, string>;
}

export interface PilotStats {
  total: number;
  pendingReview: number;
  supplierCorrectionsPending: number;
  rejectedThisMonth: number;
  avgReviewTimeMinutes: number;
  isSampleData: true;
}

export interface InspectionProfile {
  id: string;
  name: string;
  description: string;
  checklistItems: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  category: FindingCategory;
}

export interface ComparisonResult {
  inspectionId: string;
  findings: Finding[];
  summary: FindingsSummary;
  recommendation: string;
  completedAt: string;
}

export interface FindingsSummary {
  totalFindings: number;
  critical: number;
  major: number;
  minor: number;
  recommendation: string;
  confidence: number;
}
