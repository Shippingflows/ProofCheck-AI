import {
  InspectionStatus,
  FindingSeverity,
  FindingCategory,
  ReviewDecision,
  AuditAction,
} from "./enums";

export interface Inspection {
  id: string;
  title: string;
  sku: string;
  revision: string;
  status: InspectionStatus;
  decision: ReviewDecision;
  createdAt: string;
  updatedAt: string;
  reviewerName: string;
  masterFileRef: string;
  supplierFileRef: string;
  profileRef: string | null;
  findingsCount: {
    critical: number;
    major: number;
    minor: number;
  };
  recommendation: string | null;
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
  inspectionId: string;
  action: AuditAction;
  actor: string;
  timestamp: string;
  metadata: Record<string, string>;
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
