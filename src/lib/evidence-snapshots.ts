/** Static evidence crop paths for demo findings (SVG snippets). */
export const EVIDENCE_SNAPSHOTS: Record<
  string,
  { master: string; supplier: string }
> = {
  find_001: {
    master: "/demo/evidence/rev-master.svg",
    supplier: "/demo/evidence/rev-supplier.svg",
  },
  find_002: {
    master: "/demo/evidence/barcode-master.svg",
    supplier: "/demo/evidence/barcode-supplier.svg",
  },
  find_003: {
    master: "/demo/evidence/lot-master.svg",
    supplier: "/demo/evidence/lot-supplier.svg",
  },
  find_004: {
    master: "/demo/evidence/storage-master.svg",
    supplier: "/demo/evidence/storage-supplier.svg",
  },
  find_005: {
    master: "/demo/evidence/warning-master.svg",
    supplier: "/demo/evidence/warning-supplier.svg",
  },
  find_006: {
    master: "/demo/evidence/title-master.svg",
    supplier: "/demo/evidence/title-supplier.svg",
  },
  find_007: {
    master: "/demo/evidence/sterile-master.svg",
    supplier: "/demo/evidence/sterile-supplier.svg",
  },
};

export function getEvidenceSnapshots(findingId: string) {
  return EVIDENCE_SNAPSHOTS[findingId] ?? null;
}
