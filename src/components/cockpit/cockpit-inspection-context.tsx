"use client";

import { Inspection } from "@/domain/models";
import { cn } from "@/lib/utils";

interface CockpitInspectionContextProps {
  inspection: Inspection;
}

const ACTIVITY = [
  { time: "17:38", text: "Approved master uploaded by Sarah Chen" },
  { time: "17:40", text: "Supplier proof uploaded by Sarah Chen" },
  { time: "17:41", text: "Profile v1.8 selected · SOP-QA-214" },
  { time: "17:44", text: "Comparison completed · 10 findings" },
];

export function CockpitInspectionContext({ inspection }: CockpitInspectionContextProps) {
  return (
    <aside className="cockpit-panel max-h-[calc(100vh-190px)] overflow-auto">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-[11px]">
        <div className="font-extrabold text-foreground">Inspection Context</div>
        <span className="cockpit-pill cockpit-pill-ok">Traceable</span>
      </div>
      <div className="grid gap-2.5 p-3">
        <div className="border border-border bg-[#fbfcfe] p-2.5">
          <div className="cockpit-label">Supplier quality signal</div>
          <div className="grid grid-cols-2 gap-2">
            <Kv k="Open CARs" v="1" />
            <Kv k="Past 90d rejects" v="2" />
            <Kv k="On-time proofs" v="94%" />
            <Kv k="Risk trend" v="Watch" vClass="text-[#b45309]" />
          </div>
        </div>

        <div className="border-l-[3px] border-[#174ea6] bg-[#f8fbff] p-2.5 text-[13px]">
          <b>AI governance</b>
          <br />
          <span className="cockpit-tiny text-[#667085]">
            Potential differences only. QA reviewer confirms, dismisses, or escalates.
            ProofCheck never approves regulated materials automatically.
          </span>
        </div>

        <div className="border border-border bg-[#fbfcfe] p-2.5">
          <div className="cockpit-label">Controlled documents</div>
          <Kv
            k="Approved master"
            v="bt-sck-240-rev04-approved.pdf"
            note="6 pages · SHA256 9F2A…81C · OCR complete · preflight passed"
          />
          <div className="mt-2" />
          <Kv
            k="Supplier proof"
            v="bt-sck-240-supplier-proof-v1.pdf"
            note="6 pages · SHA256 C43B…19D · OCR complete · preflight passed"
          />
        </div>

        <div className="border border-border bg-[#fbfcfe] p-2.5">
          <div className="cockpit-label">Recent activity</div>
          {ACTIVITY.map((line) => (
            <div
              key={line.time}
              className="grid grid-cols-[58px_1fr] gap-2 border-b border-[#eef1f4] py-2 last:border-b-0"
            >
              <div className="font-mono text-[10px] text-[#667085]">{line.time}</div>
              <div className="text-[13px]">{line.text}</div>
            </div>
          ))}
        </div>

        <div className="cockpit-tiny text-[#667085]">
          Inspection: {inspection.id} · Reviewer: {inspection.reviewerName}
        </div>
      </div>
    </aside>
  );
}

function Kv({
  k,
  v,
  note,
  vClass,
}: {
  k: string;
  v: string;
  note?: string;
  vClass?: string;
}) {
  return (
    <div className="border-b border-[#eef1f4] pb-1.5">
      <div className="font-mono text-[9px] uppercase text-[#667085]">{k}</div>
      <div className={cn("mt-0.5 font-extrabold", vClass)}>{v}</div>
      {note && <div className="cockpit-tiny mt-0.5">{note}</div>}
    </div>
  );
}