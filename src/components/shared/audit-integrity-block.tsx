import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditEvent } from "@/domain/models";
import { ShieldCheck } from "lucide-react";

interface AuditIntegrityBlockProps {
  events: AuditEvent[];
  masterHash?: string | null;
  supplierHash?: string | null;
}

export function AuditIntegrityBlock({
  events,
  masterHash,
  supplierHash,
}: AuditIntegrityBlockProps) {
  const latest = events[0];
  const chainLength = events.length;

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Audit Integrity</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Immutable event chain with actor attribution and file hashes.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 pt-0 text-xs sm:grid-cols-2">
        <IntegrityField label="Events recorded" value={String(chainLength)} />
        <IntegrityField
          label="Latest event"
          value={latest?.eventId ?? "—"}
        />
        <IntegrityField
          label="Master file hash"
          value={masterHash ? truncateHash(masterHash) : "—"}
          mono
        />
        <IntegrityField
          label="Supplier file hash"
          value={supplierHash ? truncateHash(supplierHash) : "—"}
          mono
        />
        <IntegrityField
          label="Integrity status"
          value="Verified (pilot sample)"
        />
        <IntegrityField
          label="Retention"
          value="7 years (policy placeholder)"
        />
      </CardContent>
    </Card>
  );
}

function IntegrityField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={mono ? "font-mono text-[11px] text-foreground" : "font-medium text-foreground"}>
        {value}
      </p>
    </div>
  );
}

function truncateHash(hash: string): string {
  if (hash.length <= 20) return hash;
  return `${hash.slice(0, 12)}…${hash.slice(-8)}`;
}
