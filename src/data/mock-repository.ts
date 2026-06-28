import { Inspection, Finding, AuditEvent } from "@/domain/models";
import { seedInspections, seedFindings, seedAuditEvents } from "./seed";

let inspections: Inspection[] = [...seedInspections];
let findings: Finding[] = [...seedFindings];
let auditEvents: AuditEvent[] = [...seedAuditEvents];

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

export async function createInspection(
  data: Omit<Inspection, "id" | "createdAt" | "updatedAt" | "findingsCount" | "recommendation">
): Promise<Inspection> {
  const inspection: Inspection = {
    ...data,
    id: `insp_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    findingsCount: { critical: 0, major: 0, minor: 0 },
    recommendation: null,
  };
  inspections = [inspection, ...inspections];
  return inspection;
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

export async function addAuditEvent(
  data: Omit<AuditEvent, "id" | "timestamp">
): Promise<AuditEvent> {
  const event: AuditEvent = {
    ...data,
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  auditEvents = [event, ...auditEvents];
  return event;
}

export async function getStats() {
  const all = await getInspections();
  return {
    total: all.length,
    pendingReview: all.filter((i) => i.status === "pending_review").length,
    approved: all.filter((i) => i.status === "approved").length,
    rejected: all.filter((i) => i.status === "rejected").length,
  };
}

/**
 * Restores all in-memory collections to their original seeded state.
 * Only intended for demo mode so reviewers can reset between walkthroughs.
 */
export async function resetDemoData(): Promise<void> {
  inspections = [...seedInspections];
  findings = [...seedFindings];
  auditEvents = [...seedAuditEvents];
}
