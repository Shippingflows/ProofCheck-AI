"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlaskConical, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDropZone } from "./file-drop-zone";
import {
  inspectionFormSchema,
  ACCEPTED_EXTENSIONS,
  INSPECTION_PROFILES,
  CHECKLIST_OPTIONS,
  REVIEWERS,
  VARIANCE_SENSITIVITY_OPTIONS,
} from "./form-schema";
import { createInspection, addAuditEvent } from "@/data/mock-repository";
import { InspectionStatus, ReviewDecision, AuditAction } from "@/domain/enums";
import { DEMO_INSPECTION_ID, DEMO_FORM_TITLE, isDemoFormSubmission } from "@/data/seed";
import { IS_DEMO_MODE } from "@/lib/demo";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "@/components/shared/info-tooltip";

interface FormInput {
  title: string;
  supplierName: string;
  productName: string;
  masterFile: File | null;
  supplierFile: File | null;
  profileId: string;
  checklistIds: string[];
  criticalFields: string;
  reviewerName: string;
  varianceSensitivity: "strict" | "standard" | "visual_review";
}

export function NewInspectionForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoFormFilled, setIsDemoFormFilled] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(inspectionFormSchema) as never,
    defaultValues: {
      title: "",
      supplierName: "",
      productName: "",
      masterFile: null,
      supplierFile: null,
      profileId: "",
      checklistIds: [],
      criticalFields: "",
      reviewerName: "",
      varianceSensitivity: "standard",
    },
  });

  const onSubmit = async (data: FormInput) => {
    setIsSubmitting(true);

    // Demo form submissions always open the seeded BioTouch inspection with 10 findings
    if (
      IS_DEMO_MODE &&
      (isDemoFormFilled || isDemoFormSubmission(data.title, data.supplierName))
    ) {
      router.push(`/comparison/${DEMO_INSPECTION_ID}`);
      return;
    }

    const inspection = await createInspection({
      title: data.title,
      sku: "",
      revision: "",
      status: InspectionStatus.Comparing,
      decision: ReviewDecision.Pending,
      reviewerName: data.reviewerName,
      masterFileRef: `files/master/${data.masterFile?.name ?? "master.pdf"}`,
      supplierFileRef: `files/supplier/${data.supplierFile?.name ?? "supplier.pdf"}`,
      profileRef: data.profileId,
    });

    await addAuditEvent({
      inspectionId: inspection.id,
      action: AuditAction.InspectionCreated,
      actor: data.reviewerName,
      metadata: { title: data.title, supplier: data.supplierName },
    });

    await addAuditEvent({
      inspectionId: inspection.id,
      action: AuditAction.MasterFileUploaded,
      actor: data.reviewerName,
      metadata: { fileName: data.masterFile?.name ?? "" },
    });

    await addAuditEvent({
      inspectionId: inspection.id,
      action: AuditAction.SupplierFileUploaded,
      actor: data.reviewerName,
      metadata: { fileName: data.supplierFile?.name ?? "" },
    });

    await addAuditEvent({
      inspectionId: inspection.id,
      action: AuditAction.ComparisonStarted,
      actor: "System",
      metadata: { sensitivity: data.varianceSensitivity },
    });

    router.push(`/comparison/${inspection.id}`);
  };

  const loadDemoInspection = () => {
    setIsDemoFormFilled(true);
    const demoFile = new File(["demo"], "bt-sck-240-rev04-approved.pdf", {
      type: "application/pdf",
    });
    const supplierFile = new File(["demo"], "bt-sck-240-supplier-proof-v1.pdf", {
      type: "application/pdf",
    });

    reset({
      title: DEMO_FORM_TITLE,
      supplierName: "Pacific Print Solutions",
      productName: "BioTouch Sample Collection Kit",
      masterFile: demoFile,
      supplierFile: supplierFile,
      profileId: "profile_medical_device_01",
      checklistIds: [
        "chk_text",
        "chk_barcode",
        "chk_symbols",
        "chk_metadata",
        "chk_missing",
      ],
      criticalFields:
        "SKU: BT-SCK-240\nRevision: REV-04\nBarcode: 8421-9940-22\nWarning: For professional use only\nStorage: Store at 2–8°C\nLOT: ______\nEXP: ______",
      reviewerName: "Sarah Chen",
      varianceSensitivity: "standard",
    });
  };

  const loadDemoAndRoute = () => {
    router.push(`/comparison/${DEMO_INSPECTION_ID}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sample workflow shortcut */}
      <Card className="border border-dashed border-primary/30 bg-primary/5 shadow-none">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Sample Inspection
              </p>
              <p className="text-xs text-muted-foreground">
                Load the BioTouch sample to walk through the review workflow
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadDemoInspection}
            >
              Fill Form
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={loadDemoAndRoute}
            >
              Open Sample Review
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Inspection Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Inspection Title</Label>
            <Input
              id="title"
              placeholder="e.g. BioTouch Sample Collection Kit — Supplier Proof Review"
              {...register("title")}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="supplierName">Supplier Name</Label>
              <Input
                id="supplierName"
                placeholder="e.g. Pacific Print Solutions"
                {...register("supplierName")}
                aria-invalid={!!errors.supplierName}
              />
              {errors.supplierName && (
                <p className="text-xs text-destructive">
                  {errors.supplierName.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="productName">Product / Project Name</Label>
              <Input
                id="productName"
                placeholder="e.g. BioTouch Sample Collection Kit"
                {...register("productName")}
                aria-invalid={!!errors.productName}
              />
              {errors.productName && (
                <p className="text-xs text-destructive">
                  {errors.productName.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Uploads */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Document Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <Controller
              name="masterFile"
              control={control}
              render={({ field }) => (
                <FileDropZone
                  label="Approved Master / Artwork"
                  description="Drop approved master file here or click to browse"
                  accept={ACCEPTED_EXTENSIONS}
                  file={field.value}
                  onFileSelect={(f) => field.onChange(f)}
                  error={errors.masterFile?.message as string | undefined}
                />
              )}
            />
            <Controller
              name="supplierFile"
              control={control}
              render={({ field }) => (
                <FileDropZone
                  label="Supplier Production File"
                  description="Drop supplier proof file here or click to browse"
                  accept={ACCEPTED_EXTENSIONS}
                  file={field.value}
                  onFileSelect={(f) => field.onChange(f)}
                  error={errors.supplierFile?.message as string | undefined}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Inspection Configuration */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Inspection Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Profile Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="profileId" className="inline-flex items-center gap-1.5">
              Inspection Profile
              <InfoTooltip content="A preset that tailors which checks run and how strictly differences are flagged for a given product category (e.g. medical device packaging vs. food labels)." />
            </Label>
            <select
              id="profileId"
              {...register("profileId")}
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                errors.profileId && "border-destructive"
              )}
            >
              <option value="">Select a profile...</option>
              {INSPECTION_PROFILES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.profileId && (
              <p className="text-xs text-destructive">
                {errors.profileId.message}
              </p>
            )}
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <Label className="inline-flex items-center gap-1.5">
              Comparison Checklist
              <InfoTooltip content="The categories of differences the comparison will look for. Selecting more checks broadens coverage but may surface more low-severity items to review." />
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {CHECKLIST_OPTIONS.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2.5 text-sm transition-colors hover:bg-accent cursor-pointer has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5"
                >
                  <input
                    type="checkbox"
                    value={item.id}
                    {...register("checklistIds")}
                    className="h-4 w-4 rounded border-border text-primary accent-primary"
                  />
                  <span className="text-foreground">{item.label}</span>
                </label>
              ))}
            </div>
            {errors.checklistIds && (
              <p className="text-xs text-destructive">
                {errors.checklistIds.message}
              </p>
            )}
          </div>

          {/* Critical Fields */}
          <div className="space-y-1.5">
            <Label htmlFor="criticalFields" className="inline-flex items-center gap-1.5">
              Critical Fields{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
              <InfoTooltip content="Exact approved reference values (SKU, barcode, warning text). Differences in these fields are treated with the lowest tolerance and flagged at higher severity." />
            </Label>
            <Textarea
              id="criticalFields"
              placeholder="Enter approved reference values — one per line&#10;e.g. SKU: BT-SCK-240&#10;Barcode: 8421-9940-22"
              rows={5}
              {...register("criticalFields")}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              These values will be compared against the supplier file. One field
              per line.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Review Settings */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Review Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Reviewer Assignment */}
          <div className="space-y-1.5">
            <Label htmlFor="reviewerName">Assign Reviewer</Label>
            <select
              id="reviewerName"
              {...register("reviewerName")}
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                errors.reviewerName && "border-destructive"
              )}
            >
              <option value="">Select reviewer...</option>
              {REVIEWERS.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.reviewerName && (
              <p className="text-xs text-destructive">
                {errors.reviewerName.message}
              </p>
            )}
          </div>

          {/* Variance Sensitivity */}
          <div className="space-y-2">
            <Label className="inline-flex items-center gap-1.5">
              Visual Variance Sensitivity
              <InfoTooltip content="The tolerance for visual differences. Strict flags even small deviations; Standard flags meaningful differences; Visual Review focuses on obvious changes. Higher sensitivity surfaces more potential mismatches." />
            </Label>
            <Controller
              name="varianceSensitivity"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-3">
                  {VARIANCE_SENSITIVITY_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={cn(
                        "flex cursor-pointer flex-col gap-1 rounded-md border px-4 py-3 transition-colors",
                        field.value === opt.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <input
                        type="radio"
                        value={opt.id}
                        checked={field.value === opt.id}
                        onChange={() => field.onChange(opt.id)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium text-foreground">
                        {opt.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {opt.description}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            />
            {errors.varianceSensitivity && (
              <p className="text-xs text-destructive">
                {errors.varianceSensitivity.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Starting Comparison..." : "Start Comparison"}
        </Button>
      </div>
    </form>
  );
}
