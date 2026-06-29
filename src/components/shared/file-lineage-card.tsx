"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inspection } from "@/domain/models";
import { FileLineageEntry } from "@/domain/models";

interface FileLineageCardProps {
  inspection: Inspection;
}

function buildLineage(inspection: Inspection): FileLineageEntry[] {
  const entries: FileLineageEntry[] = [];
  if (inspection.masterFileHash) {
    entries.push({
      role: "master",
      fileName: inspection.masterFileRef,
      revision: inspection.revision,
      version: "v1.0",
      versionLocked: true,
      uploadedBy: inspection.reviewerName,
      uploadedAt: inspection.masterUploadedAt ?? inspection.createdAt,
      sha256: inspection.masterFileHash,
    });
  }
  if (inspection.supplierFileHash) {
    entries.push({
      role: "supplier",
      fileName: inspection.supplierFileRef,
      revision: inspection.revision,
      version: "v1.0",
      versionLocked: false,
      uploadedBy: inspection.supplierName || "Supplier",
      uploadedAt: inspection.supplierUploadedAt ?? inspection.createdAt,
      sha256: inspection.supplierFileHash,
    });
  }
  return entries;
}

export function FileLineageCard({ inspection }: FileLineageCardProps) {
  const entries = buildLineage(inspection);
  if (entries.length === 0) return null;

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">File Lineage</CardTitle>
        <p className="text-xs text-muted-foreground">
          Version-locked master and supplier file hashes for audit traceability.
        </p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {entries.map((entry) => (
          <div
            key={entry.role}
            className="rounded-md border border-border bg-muted/30 p-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium capitalize text-foreground">
                {entry.role} file
              </span>
              {entry.versionLocked && (
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                  Locked
                </span>
              )}
            </div>
            <p className="mt-1 font-mono text-muted-foreground">{entry.fileName}</p>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-muted-foreground">
              <span>Revision: {entry.revision}</span>
              <span>Version: {entry.version}</span>
              <span>Uploaded by: {entry.uploadedBy}</span>
              <span>
                {new Date(entry.uploadedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <p className="mt-2 break-all font-mono text-[10px] text-foreground">
              SHA-256: {entry.sha256}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
