"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useInspection, useFindings, useAuditEvents } from "@/hooks/use-inspections";
import { DEMO_INSPECTION_ID } from "@/data/seed";
import { FindingSeverity, FindingCategory } from "@/domain/enums";
import { Finding } from "@/domain/models";
import { QueryProvider } from "@/lib/query-client";
import { RECOMMENDATION_PENDING_NOTE, formatRecommendation } from "@/lib/recommendations";

const severityLabels: Record<FindingSeverity, string> = {
  [FindingSeverity.Critical]: "CRITICAL",
  [FindingSeverity.Major]: "MAJOR",
  [FindingSeverity.Minor]: "MINOR",
};

const categoryLabels: Record<FindingCategory, string> = {
  [FindingCategory.TextContent]: "Text Content",
  [FindingCategory.Barcode]: "Barcode / QR",
  [FindingCategory.Symbol]: "Symbols",
  [FindingCategory.Layout]: "Layout",
  [FindingCategory.Color]: "Color",
  [FindingCategory.Typography]: "Typography",
  [FindingCategory.Metadata]: "Metadata",
  [FindingCategory.MissingElement]: "Missing Elements",
};

function PrintReportInner() {
  const inspectionId = DEMO_INSPECTION_ID;
  const { data: inspection, isLoading: li } = useInspection(inspectionId);
  const { data: findings = [], isLoading: lf } = useFindings(inspectionId);
  const { data: events = [], isLoading: le } = useAuditEvents(inspectionId);

  useEffect(() => {
    if (!li && !lf && !le && inspection) {
      setTimeout(() => window.print(), 500);
    }
  }, [li, lf, le, inspection]);

  if (li || lf || le) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!inspection) {
    return <p>Inspection not found.</p>;
  }

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="mx-auto max-w-[800px] p-8 font-sans text-[11px] leading-relaxed text-slate-800 print:p-0">
      {/* Header */}
      <div className="mb-6 border-b-2 border-slate-800 pb-4">
        <h1 className="text-xl font-bold">ProofCheck AI — Findings Report</h1>
        <p className="mt-1 text-sm text-slate-600">{inspection.title}</p>
      </div>

      {/* Meta */}
      <div className="mb-6 grid grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-500">SKU:</span>
          <br />
          <strong>{inspection.sku}</strong>
        </div>
        <div>
          <span className="text-slate-500">Revision:</span>
          <br />
          <strong>{inspection.revision}</strong>
        </div>
        <div>
          <span className="text-slate-500">Reviewer:</span>
          <br />
          <strong>{inspection.reviewerName}</strong>
        </div>
        <div>
          <span className="text-slate-500">Date:</span>
          <br />
          <strong>
            {new Date(inspection.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </strong>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mb-6 rounded border border-slate-300 bg-slate-50 px-4 py-3">
        <p className="text-xs font-bold uppercase text-slate-500">
          Recommendation
        </p>
        <p className="mt-1 text-sm font-bold">
          {inspection.recommendation
            ? formatRecommendation(inspection.recommendation).action
            : "Pending Review"}
        </p>
        <p className="mt-1 text-xs text-slate-600">
          {inspection.recommendationNote ?? RECOMMENDATION_PENDING_NOTE}
        </p>
        <p className="mt-1 text-xs text-slate-600">
          {inspection.findingsCount.critical} Critical ·{" "}
          {inspection.findingsCount.major} Major ·{" "}
          {inspection.findingsCount.minor} Minor
        </p>
      </div>

      {/* File integrity */}
      {(inspection.masterFileHash || inspection.supplierFileHash) && (
        <div className="mb-6 rounded border border-slate-200 px-4 py-3 text-[10px]">
          <p className="font-bold uppercase text-slate-500">File Hashes</p>
          {inspection.masterFileHash && (
            <p className="mt-1 font-mono">Master: {inspection.masterFileHash}</p>
          )}
          {inspection.supplierFileHash && (
            <p className="mt-1 font-mono">Supplier: {inspection.supplierFileHash}</p>
          )}
        </div>
      )}

      {/* Findings table */}
      <h2 className="mb-2 text-sm font-bold">Findings Detail</h2>
      <table className="mb-6 w-full border-collapse text-[10px]">
        <thead>
          <tr className="border-b border-slate-300 text-left">
            <th className="py-1.5 pr-2 font-semibold">#</th>
            <th className="py-1.5 pr-2 font-semibold">Severity</th>
            <th className="py-1.5 pr-2 font-semibold">Category</th>
            <th className="py-1.5 pr-2 font-semibold">Finding</th>
            <th className="py-1.5 pr-2 font-semibold">Approved</th>
            <th className="py-1.5 pr-2 font-semibold">Supplier</th>
            <th className="py-1.5 font-semibold">Location</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((f: Finding, i: number) => (
            <tr key={f.id} className="border-b border-slate-200">
              <td className="py-1.5 pr-2">{i + 1}</td>
              <td className="py-1.5 pr-2 font-bold">
                {severityLabels[f.severity]}
              </td>
              <td className="py-1.5 pr-2">
                {categoryLabels[f.category]}
              </td>
              <td className="py-1.5 pr-2">{f.title}</td>
              <td className="py-1.5 pr-2 font-mono">
                {f.sourceValue ?? "—"}
              </td>
              <td className="py-1.5 pr-2 font-mono">
                {f.supplierValue ?? "Missing"}
              </td>
              <td className="py-1.5">
                Page {f.pageNumber}, {f.location}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Audit trail */}
      <h2 className="mb-2 text-sm font-bold">Audit Trail</h2>
      <table className="mb-6 w-full border-collapse text-[10px]">
        <thead>
          <tr className="border-b border-slate-300 text-left">
            <th className="py-1.5 pr-2 font-semibold">Event ID</th>
            <th className="py-1.5 pr-2 font-semibold">Timestamp</th>
            <th className="py-1.5 pr-2 font-semibold">Event</th>
            <th className="py-1.5 pr-2 font-semibold">Actor</th>
            <th className="py-1.5 font-semibold">Details</th>
          </tr>
        </thead>
        <tbody>
          {sortedEvents.map((e) => (
            <tr key={e.id} className="border-b border-slate-200">
              <td className="py-1.5 pr-2 font-mono">{e.eventId}</td>
              <td className="py-1.5 pr-2 whitespace-nowrap">
                {e.timestampLocal}
              </td>
              <td className="py-1.5 pr-2">
                {e.action.replace(/_/g, " ")}
              </td>
              <td className="py-1.5 pr-2">
                {e.actor} ({e.actorRole})
              </td>
              <td className="py-1.5">
                {Object.entries(e.metadata)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="mt-8 border-t border-slate-300 pt-4 text-center text-[9px] text-slate-500">
        <p>
          Generated by ProofCheck AI · AI-assisted review — human confirmation
          required
        </p>
        <p>
          This document does not constitute compliance approval. All findings
          require human verification.
        </p>
      </div>
    </div>
  );
}

export default function PrintReportPage() {
  return (
    <QueryProvider>
      <PrintReportInner />
    </QueryProvider>
  );
}
