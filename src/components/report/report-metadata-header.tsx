import { Inspection } from "@/domain/models";
import { Card, CardContent } from "@/components/ui/card";
import { getProfileSummary } from "@/lib/inspection-profile";

interface ReportMetadataHeaderProps {
  inspection: Inspection;
}

export function ReportMetadataHeader({ inspection }: ReportMetadataHeaderProps) {
  const profile = getProfileSummary(inspection.profileRef);
  const generated = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const fields = [
    { label: "Report ID", value: "RPT-BT-SCK-240-001" },
    { label: "Inspection ID", value: "INS-BT-SCK-240-001" },
    { label: "Generated", value: generated },
    { label: "Supplier", value: inspection.supplierName },
    { label: "Reviewer", value: inspection.reviewerName },
    {
      label: "Master file",
      value: inspection.masterFileRef.split("/").pop() ?? inspection.masterFileRef,
    },
    {
      label: "Supplier file",
      value: inspection.supplierFileRef.split("/").pop() ?? inspection.supplierFileRef,
    },
    {
      label: "Profile version",
      value: profile ? `${profile.name} / ${profile.sensitivity}` : "—",
    },
  ];

  return (
    <Card className="border border-border shadow-none">
      <CardContent className="grid gap-x-6 gap-y-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map((field) => (
          <div key={field.label} className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {field.label}
            </p>
            <p className="truncate text-xs font-medium text-foreground">
              {field.value}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
