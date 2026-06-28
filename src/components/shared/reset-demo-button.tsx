"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RotateCcw, Loader2 } from "lucide-react";
import { resetDemoData } from "@/data/mock-repository";
import { IS_DEMO_MODE } from "@/lib/demo";
import { cn } from "@/lib/utils";

export function ResetDemoButton({ className }: { className?: string }) {
  const queryClient = useQueryClient();
  const [isResetting, setIsResetting] = useState(false);
  const [done, setDone] = useState(false);

  if (!IS_DEMO_MODE) return null;

  const handleReset = async () => {
    setIsResetting(true);
    await resetDemoData();
    await queryClient.invalidateQueries();
    setIsResetting(false);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleReset}
      disabled={isResetting}
      className={cn(
        "flex w-full items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-60",
        className
      )}
    >
      {isResetting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <RotateCcw className="h-3.5 w-3.5" />
      )}
      {done ? "Demo data reset" : "Reset Demo Data"}
    </button>
  );
}
