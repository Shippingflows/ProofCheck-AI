"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileCheck2,
  ListChecks,
  Send,
  Gavel,
  X,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "proofcheck.onboarding.dismissed";

const STEPS = [
  {
    icon: Upload,
    title: "Upload approved master",
    description: "Add the artwork or proof that has already been approved.",
  },
  {
    icon: FileCheck2,
    title: "Upload supplier proof",
    description: "Add the supplier-submitted production file to compare.",
  },
  {
    icon: ListChecks,
    title: "Review findings",
    description: "Inspect evidence-based differences ranked by severity.",
  },
  {
    icon: Send,
    title: "Send correction",
    description: "Draft a supplier correction request from selected findings.",
  },
  {
    icon: Gavel,
    title: "Approve or reject",
    description: "Record a human decision. Nothing is approved automatically.",
  },
];

export function OnboardingPanel() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      dismissed = false;
    }
    // Reading persisted dismissal from localStorage (an external system) on
    // mount; deferring to an effect avoids a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(!dismissed);
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore storage errors
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Card className="relative border border-primary/20 bg-primary/5 shadow-none">
      <CardContent className="p-5">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss getting started"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Getting started
          </h3>
          <p className="text-xs text-muted-foreground">
            ProofCheck AI prepares a human review in five steps. It assists the
            reviewer and never approves a file on its own.
          </p>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {STEPS.map((step, idx) => (
            <div key={step.title} className="relative">
              <div className="flex h-full flex-col gap-2 rounded-md border border-border bg-card p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <step.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {idx + 1}. {step.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button size="sm" onClick={() => router.push("/inspections/new")}>
            Start an inspection
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={dismiss}>
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
