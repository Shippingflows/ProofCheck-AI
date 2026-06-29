"use client";

import { useState } from "react";
import Image from "next/image";
import { Finding } from "@/domain/models";
import { FindingSeverity } from "@/domain/enums";
import { cn } from "@/lib/utils";
import type { FindingMarker } from "@/components/comparison/document-panel";

const PAGE_W = 500;
const PAGE_H = 700;

interface CockpitDocumentViewerProps {
  selectedFindingId: string | null;
  selectedFinding: Finding | null;
  findingNumberMap: Map<string, number>;
  markers: FindingMarker[];
  masterSrc: string | null;
  supplierSrc: string | null;
  overlayVisible: boolean;
  onSelectFinding: (id: string) => void;
}

type ViewerTab = "fit" | "overlay" | "blink" | "ocr";

export function CockpitDocumentViewer({
  selectedFindingId,
  selectedFinding,
  findingNumberMap,
  markers,
  masterSrc,
  supplierSrc,
  overlayVisible,
  onSelectFinding,
}: CockpitDocumentViewerProps) {
  const [tab, setTab] = useState<ViewerTab>("fit");
  const selectedNum = selectedFindingId
    ? findingNumberMap.get(selectedFindingId) ?? null
    : null;

  const masterCrop =
    selectedFinding?.sourceValue?.toUpperCase().includes("STERILE")
      ? "STERILE SYMBOL PRESENT"
      : (selectedFinding?.sourceValue ?? "—");
  const supplierCrop = selectedFinding?.supplierValue
    ? selectedFinding.supplierValue.toUpperCase()
    : "(NOT DETECTED)";

  return (
    <section className="cockpit-panel min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-[11px]">
        <div>
          <div className="font-extrabold text-foreground">Master vs Supplier Proof</div>
          <div className="cockpit-tiny text-[#667085]">
            {selectedNum
              ? `Selected finding F-${String(selectedNum).padStart(3, "0")} is zoom-linked to annotation marker ${selectedNum} on both documents.`
              : "Select a finding to link annotation markers."}
          </div>
        </div>
        <div className="flex gap-1">
          {(["fit", "overlay", "blink", "ocr"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn("cockpit-tab capitalize", tab === t && "cockpit-tab-on")}
            >
              {t === "ocr" ? "OCR" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3">
        <div className="mb-2.5 flex items-center justify-between border border-border bg-card px-2.5 py-2 text-[13px]">
          <div>
            <b>Approved Master</b>{" "}
            <span className="cockpit-tiny text-[#667085]">REV-04 · locked</span>
          </div>
          <div>
            <b>Supplier Proof</b>{" "}
            <span className="cockpit-tiny text-[#667085]">
              REV-04 claimed · differences detected
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
          <CockpitDoc
            variant="master"
            src={masterSrc}
            markers={markers}
            selectedFindingId={selectedFindingId}
            overlayVisible={overlayVisible && tab !== "ocr"}
            onSelectFinding={onSelectFinding}
          />
          <CockpitDoc
            variant="supplier"
            src={supplierSrc}
            markers={markers}
            selectedFindingId={selectedFindingId}
            overlayVisible={overlayVisible && tab !== "ocr"}
            onSelectFinding={onSelectFinding}
            supplierTitle="BioTauch Diagnostics"
          />
        </div>

        <div className="cockpit-section-label">Selected evidence zoom</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="min-h-[82px] border border-border bg-[#fbfcfe] p-2.5">
            <div className="cockpit-label">Approved master crop</div>
            <div className="mt-2 font-mono text-2xl font-black text-[#047857]">
              {masterCrop}
            </div>
          </div>
          <div className="min-h-[82px] border border-border bg-[#fbfcfe] p-2.5">
            <div className="cockpit-label">Supplier proof crop</div>
            <div className="mt-2 font-mono text-2xl font-black text-[#b91c1c]">
              {supplierCrop}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CockpitDoc({
  variant,
  src,
  markers,
  selectedFindingId,
  overlayVisible,
  onSelectFinding,
  supplierTitle,
}: {
  variant: "master" | "supplier";
  src: string | null;
  markers: FindingMarker[];
  selectedFindingId: string | null;
  overlayVisible: boolean;
  onSelectFinding: (id: string) => void;
  supplierTitle?: string;
}) {
  const isMaster = variant === "master";

  return (
    <div className="relative h-[500px] overflow-hidden border border-[#cbd5e1] bg-[#f8fafc] p-4 lg:h-[610px]">
      <div className="absolute inset-2.5 border border-[#e2e8f0] bg-white" />
      <div className="relative h-full overflow-hidden border border-[#dbe3ee] bg-white p-4">
        {src ? (
          <div className="relative mx-auto h-full w-full max-w-[340px]">
            <Image
              src={src}
              alt={isMaster ? "Approved master" : "Supplier proof"}
              fill
              className="object-contain object-top"
              unoptimized
            />
            {overlayVisible &&
              markers.map((m) => {
                const isSel = m.id === selectedFindingId;
                const left = (m.region.x / PAGE_W) * 100;
                const top = (m.region.y / PAGE_H) * 100;
                const width = (m.region.width / PAGE_W) * 100;
                const height = (m.region.height / PAGE_H) * 100;
                return (
                  <div key={m.id}>
                    {isSel && (
                      <div
                        className={cn(
                          "pointer-events-none absolute border-2",
                          isMaster
                            ? "border-[#047857] bg-[rgba(4,120,87,0.06)]"
                            : "border-[#b91c1c] bg-[rgba(185,28,28,0.08)]"
                        )}
                        style={{
                          left: `${left}%`,
                          top: `${top}%`,
                          width: `${width}%`,
                          height: `${height}%`,
                        }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectFinding(m.id)}
                      className={cn(
                        "absolute grid h-6 w-6 place-items-center border border-white font-mono text-[11px] font-black text-white shadow-[0_4px_12px_rgba(0,0,0,0.22)]",
                        m.severity === FindingSeverity.Critical
                          ? "bg-[#b91c1c]"
                          : m.severity === FindingSeverity.Major
                            ? "bg-[#c2410c]"
                            : "bg-[#475569]",
                        isSel && "ring-2 ring-[#174ea6]"
                      )}
                      style={{
                        left: `calc(${left}% + ${width / 2}%)`,
                        top: `calc(${top}% + ${height / 2}%)`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {m.number}
                    </button>
                  </div>
                );
              })}
          </div>
        ) : (
          <LabelSchematic
            isMaster={isMaster}
            supplierTitle={supplierTitle}
            markers={markers}
            selectedFindingId={selectedFindingId}
            overlayVisible={overlayVisible}
            onSelectFinding={onSelectFinding}
          />
        )}
      </div>
    </div>
  );
}

function LabelSchematic({
  isMaster,
  supplierTitle,
  markers,
  selectedFindingId,
  overlayVisible,
  onSelectFinding,
}: {
  isMaster: boolean;
  supplierTitle?: string;
  markers: FindingMarker[];
  selectedFindingId: string | null;
  overlayVisible: boolean;
  onSelectFinding: (id: string) => void;
}) {
  return (
    <div className="relative h-full overflow-hidden">
      <div className="h-[54px] bg-[#1d4f91] px-2.5 py-2.5 text-lg font-black text-white">
        {isMaster ? "BioTouch Diagnostics" : supplierTitle ?? "BioTauch Diagnostics"}
      </div>
      <div className="my-2.5 h-5 bg-[#dbeafe]" />
      <div className="mx-0 my-1.5 h-7 w-[62%] border border-[#d8dde6] bg-[#fafafa]" />
      <div className="my-1.5 h-7 border border-[#d8dde6] bg-[#fafafa]" />
      <div className="my-1.5 h-7 border border-[#d8dde6] bg-[#fafafa]" />
      <div className="mx-0 my-1.5 h-7 w-[62%] border border-[#d8dde6] bg-[#fafafa]" />
      <div className="my-1.5 h-7 border border-[#d8dde6] bg-[#fafafa]" />
      <div
        className="mt-3.5 h-[58px] border border-[#333] bg-[repeating-linear-gradient(90deg,#111_0_2px,#fff_2px_4px,#111_4px_5px,#fff_5px_9px)]"
      />
      {overlayVisible &&
        markers.map((m) => {
          const isSel = m.id === selectedFindingId;
          const left = (m.region.x / PAGE_W) * 100;
          const top = (m.region.y / PAGE_H) * 100;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectFinding(m.id)}
              className={cn(
                "absolute grid h-6 w-6 place-items-center border border-white font-mono text-[11px] font-black text-white shadow-[0_4px_12px_rgba(0,0,0,0.22)]",
                m.severity === FindingSeverity.Critical
                  ? "bg-[#b91c1c]"
                  : m.severity === FindingSeverity.Major
                    ? "bg-[#c2410c]"
                    : "bg-[#475569]"
              )}
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              {m.number}
            </button>
          );
        })}
      {isSelBox(selectedFindingId) && overlayVisible && (
        <div
          className={cn(
            "pointer-events-none absolute border-2",
            isMaster
              ? "border-[#047857] bg-[rgba(4,120,87,0.06)]"
              : "border-[#b91c1c] bg-[rgba(185,28,28,0.08)]"
          )}
          style={{ left: "12%", top: "37%", width: "26%", height: "8%" }}
        />
      )}
    </div>
  );
}

function isSelBox(selectedFindingId: string | null) {
  return selectedFindingId === "find_007";
}
