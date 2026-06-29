"use client";

import { Inspection } from "@/domain/models";
import { cn } from "@/lib/utils";

interface CockpitRecordHeaderProps {
  inspection: Inspection;
}

const WORKFLOW = ["Setup", "Compare", "QA Review", "Supplier Correction", "Closed"];

export function CockpitRecordHeader({ inspection }: CockpitRecordHeaderProps) {
  return (
    <div className="mb-3 border border-border bg-card shadow-[var(--shadow-cockpit)]">
      <div className="grid grid-cols-1 items-start gap-3.5 border-b border-border p-4 md:grid-cols-[1fr_auto]">
        <div>
          <h1 className="mb-1.5 text-lg font-extrabold text-foreground">
            {inspection.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            <span className="cockpit-pill cockpit-pill-dark">INS-2026-00418</span>
            <span className="cockpit-pill cockpit-pill-crit">REGULATED / HIGH RISK</span>
            <span className="cockpit-pill cockpit-pill-maj">PENDING REVIEW</span>
            <span className="cockpit-pill">{inspection.sku}</span>
            <span className="cockpit-pill">{inspection.revision}</span>
            <span className="cockpit-pill">{inspection.supplierName}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#475467]">
          {WORKFLOW.map((step, i) => (
            <span
              key={step}
              className={cn(
                "border border-border bg-[#f8fafc] px-1.5 py-1",
                i === 1 && "border-[#111827] bg-[#111827] text-white"
              )}
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 border-b border-border md:grid-cols-3">
        <RecordCell
          label="Supplier status"
          value="Approved Supplier · SUP-1047 · Irvine, CA"
          note="1 open corrective action · 94% on-time proof rate · last inspection passed with minor findings"
        />
        <RecordCell
          label="Governed QA profile"
          value="Medical Device Label — Standard v1.8"
          note="Owner: Regulatory QA · SOP-QA-214 · approved profile"
          bordered
        />
        <RecordCell
          label="Review gate"
          value="Critical findings block release"
          note="Dismissal requires reason + Regulatory QA secondary review"
          bordered
        />
      </div>
    </div>
  );
}

function RecordCell({
  label,
  value,
  note,
  bordered = false,
}: {
  label: string;
  value: string;
  note: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={cn(
        "px-4 py-3",
        bordered && "border-t border-border md:border-t-0 md:border-l"
      )}
    >
      <div className="cockpit-label">{label}</div>
      <div className="font-extrabold text-foreground">{value}</div>
      <div className="cockpit-tiny mt-1 text-[#667085]">{note}</div>
    </div>
  );
}
