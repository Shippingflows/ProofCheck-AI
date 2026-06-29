import { Inspection, Finding, AuditEvent, PilotStats } from "@/domain/models";
import {
  CorrectionStatus,
  AuditActorRole,
  AuditEventSource,
} from "@/domain/enums";
import {
  seedInspections,
  seedFindings,
  seedAuditEvents,
  DEMO_INSPECTION_ID,
} from "./seed";

let inspections: Inspection[] = [...seedInspections];
let findings: Finding[] = [...seedFindings];
let auditEvents: AuditEvent[] = [...seedAuditEvents];
let auditEventCounter = 42;

export async function getInspections(): Promise<Inspection[]> {
  return [...inspections].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getInspectionById(
  id: string
): Promise<Inspection | null> {
  return inspections.find((i) => i.id === id) ?? null;
}

export async function getFindings(inspectionId: string): Promise<Finding[]> {
  return findings
    .filter((f) => f.inspectionId === inspectionId)
    .sort((a, b) => {
      const severityOrder = { critical: 0, major: 1, minor: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
}

export async function getAuditEvents(
  inspectionId?: string
): Promise<AuditEvent[]> {
  const filtered = inspectionId
    ? auditEvents.filter((e) => e.inspectionId === inspectionId)
    : auditEvents;
  return [...filtered].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

const defaultInspectionFields: Pick<
  Inspection,
  | "supplierName"
  | "dueDate"
  | "reviewerEmail"
  | "reviewerRole"
  | "checklistIds"
  | "recommendationNote"
  | "correctionStatus"
  | "masterFileHash"
  | "supplierFileHash"
  | "masterUploadedAt"
  | "supplierUploadedAt"
  | "checklistCompleted"
> = {
  supplierName: "",
  dueDate: null,
  reviewerEmail: "sarah.chen@demo-company.com",
  reviewerRole: "Quality Reviewer",
  checklistIds: [],
  recommendationNote: null,
  correctionStatus: CorrectionStatus.NotStarted,
  masterFileHash: null,
  supplierFileHash: null,
  masterUploadedAt: null,
  supplierUploadedAt: null,
  checklistCompleted: {},
};

export async function createInspection(
  data: Omit<
    Inspection,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "findingsCount"
    | "recommendation"
    | "supplierName"
    | "dueDate"
    | "reviewerEmail"
    | "reviewerRole"
    | "checklistIds"
    | "recommendationNote"
    | "correctionStatus"
    | "masterFileHash"
    | "supplierFileHash"
    | "masterUploadedAt"
    | "supplierUploadedAt"
    | "checklistCompleted"
  > &
    Partial<
      Pick<
        Inspection,
        | "findingsCount"
        | "recommendation"
        | "supplierName"
        | "dueDate"
        | "reviewerEmail"
        | "reviewerRole"
        | "checklistIds"
        | "recommendationNote"
        | "correctionStatus"
        | "masterFileHash"
        | "supplierFileHash"
        | "masterUploadedAt"
        | "supplierUploadedAt"
        | "checklistCompleted"
      >
    >
): Promise<Inspection> {
  const inspection: Inspection = {
    ...defaultInspectionFields,
    ...data,
    id: `insp_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    findingsCount: data.findingsCount ?? { critical: 0, major: 0, minor: 0 },
    recommendation: data.recommendation ?? null,
  };
  inspections = [inspection, ...inspections];
  return inspection;
}

/** Clone seeded BioTouch findings onto a new inspection for demo submissions. */
export async function cloneDemoFindingsToInspection(
  targetInspectionId: string
): Promise<void> {
  const demoFindings = seedFindings.filter(
    (f) => f.inspectionId === DEMO_INSPECTION_ID
  );
  const cloned = demoFindings.map((f, i) => ({
    ...f,
    id: `find_${targetInspectionId}_${i}`,
    inspectionId: targetInspectionId,
  }));
  findings = [...cloned, ...findings.filter((f) => f.inspectionId !== targetInspectionId)];
  const counts = {
    critical: cloned.filter((f) => f.severity === "critical").length,
    major: cloned.filter((f) => f.severity === "major").length,
    minor: cloned.filter((f) => f.severity === "minor").length,
  };
  await updateInspection(targetInspectionId, {
    findingsCount: counts,
    status: "pending_review" as Inspection["status"],
    recommendation: seedInspections[0].recommendation,
    correctionStatus: CorrectionStatus.DraftNeeded,
    sku: "BT-SCK-240",
    revision: "REV-04",
    supplierName: "Pacific Print Solutions",
    masterFileHash: seedInspections[0].masterFileHash,
    supplierFileHash: seedInspections[0].supplierFileHash,
    profileRef: "profile_medical_device_01",
    checklistIds: seedInspections[0].checklistIds,
    checklistCompleted: { ...seedInspections[0].checklistCompleted },
  });
}

export async function updateInspection(
  id: string,
  data: Partial<Inspection>
): Promise<Inspection | null> {
  const index = inspections.findIndex((i) => i.id === id);
  if (index === -1) return null;
  inspections[index] = {
    ...inspections[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return inspections[index];
}

export async function updateFinding(
  findingId: string,
  data: Partial<Finding>
): Promise<Finding | null> {
  const index = findings.findIndex((f) => f.id === findingId);
  if (index === -1) return null;
  findings[index] = { ...findings[index], ...data };
  return findings[index];
}

export async function addAuditEvent(
  data: Omit<
    AuditEvent,
    "id" | "timestamp" | "eventId" | "timestampLocal" | "actorRole" | "source"
  > & {
    timestampLocal?: string;
    actorRole?: AuditActorRole;
    source?: AuditEventSource;
  }
): Promise<AuditEvent> {
  auditEventCounter += 1;
  const now = new Date();
  const isSystem = data.actor === "System";
  const event: AuditEvent = {
    ...data,
    id: `audit_${Date.now()}`,
    eventId: `EVT-${String(auditEventCounter).padStart(5, "0")}`,
    timestamp: now.toISOString(),
    timestampLocal:
      data.timestampLocal ??
      now.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }),
    actorRole:
      data.actorRole ??
      (isSystem ? AuditActorRole.System : AuditActorRole.QualityReviewer),
    source:
      data.source ??
      (isSystem ? AuditEventSource.System : AuditEventSource.Reviewer),
  };
  auditEvents = [event, ...auditEvents];
  return event;
}

export async function getStats(): Promise<PilotStats> {
  return {
    total: 42,
    pendingReview: 9,
    supplierCorrectionsPending: 6,
    rejectedThisMonth: 8,
    avgReviewTimeMinutes: 11,
    isSampleData: true,
  };
}

export async function resetDemoData(): Promise<void> {
  inspections = [...seedInspections];
  findings = [...seedFindings];
  auditEvents = [...seedAuditEvents];
  auditEventCounter = 42;
}
