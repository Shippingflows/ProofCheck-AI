"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfileSummary } from "@/lib/inspection-profile";
import { Badge } from "@/components/ui/badge";

interface InspectionProfileCardProps {
  profileRef: string | null;
  compact?: boolean;
}

export function InspectionProfileCard({
  profileRef,
  compact = false,
}: InspectionProfileCardProps) {
  const profile = getProfileSummary(profileRef);
  if (!profile) return null;

  if (compact) {
    return (
      <Card className="border border-border shadow-none">
        <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-1 p-3 text-xs">
          <span className="font-medium text-foreground">{profile.name}</span>
          <Badge variant="outline" className="text-[10px]">
            {profile.sensitivity}
          </Badge>
          <span className="text-muted-foreground">
            {profile.enabledChecks.length} checks enabled
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            Inspection Profile
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {profile.sensitivity} sensitivity
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{profile.name}</p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Enabled checks
          </p>
          <ul className="mt-1 space-y-0.5">
            {profile.enabledChecks.map((check) => (
              <li key={check} className="text-xs text-foreground">
                {check}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Reference fields
          </p>
          <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
            {profile.referenceFields.map((field) => (
              <div key={field.label} className="text-xs">
                <span className="text-muted-foreground">{field.label}:</span>{" "}
                <span className="font-medium text-foreground">{field.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
