import { seedInspections, DEMO_INSPECTION_ID } from "@/data/seed";

/**
 * Global flag for the prototype. The entire app currently runs against
 * seeded mock data, so demo mode is always on. When a real backend is wired
 * in, this can be derived from an environment variable or user setting.
 */
export const IS_DEMO_MODE = true;

/**
 * IDs of the seeded sample inspections. These are flagged with a
 * "Demo Mode" badge so reviewers never mistake them for real production data.
 */
export const SEED_INSPECTION_IDS = new Set(seedInspections.map((i) => i.id));

export function isDemoInspection(id: string | null | undefined): boolean {
  if (!id) return false;
  return SEED_INSPECTION_IDS.has(id);
}

export interface DemoDocumentSet {
  master: string;
  supplier: string;
}

/**
 * Maps demo inspections to their fictional, pre-rendered label documents
 * (stored as SVG in /public/demo). These are illustrative samples only and
 * contain no real brands or regulatory marks.
 */
export const DEMO_DOCUMENTS: Record<string, DemoDocumentSet> = {
  [DEMO_INSPECTION_ID]: {
    master: "/demo/bt-sck-240-master.svg",
    supplier: "/demo/bt-sck-240-supplier.svg",
  },
};

export function getDemoDocuments(
  id: string | null | undefined
): DemoDocumentSet | null {
  if (!id) return null;
  return DEMO_DOCUMENTS[id] ?? null;
}
