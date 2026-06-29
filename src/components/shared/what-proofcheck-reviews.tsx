import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WhatProofCheckReviews() {
  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          What ProofCheck reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0 text-xs text-muted-foreground">
        <p>
          ProofCheck compares an approved master against a supplier proof and
          surfaces structured differences for human review.
        </p>
        <ul className="list-inside list-disc space-y-0.5">
          <li>Text, barcode, and symbol mismatches</li>
          <li>Missing regulatory elements and metadata</li>
          <li>Layout and typography variances</li>
        </ul>
        <p className="text-[11px] italic">
          AI-assisted detection only — a qualified reviewer makes all approval
          decisions.
        </p>
      </CardContent>
    </Card>
  );
}
