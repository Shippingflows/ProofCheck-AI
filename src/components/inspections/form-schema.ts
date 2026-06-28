import { z } from "zod";
import { validateFile } from "@/lib/file-validation";

export {
  ACCEPTED_FILE_TYPES,
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE_LABEL,
} from "@/lib/file-validation";

const validatedFile = (requiredMessage: string) =>
  z
    .instanceof(File, { message: requiredMessage })
    .nullable()
    .superRefine((f, ctx) => {
      if (f === null) {
        ctx.addIssue({ code: "custom", message: requiredMessage });
        return;
      }
      const result = validateFile(f);
      if (!result.ok) {
        ctx.addIssue({
          code: "custom",
          message: result.error ?? "Invalid file.",
        });
      }
    });

export const inspectionFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  supplierName: z.string().min(2, "Supplier name is required"),
  productName: z.string().min(2, "Product / project name is required"),
  masterFile: validatedFile("Approved master file is required"),
  supplierFile: validatedFile("Supplier production file is required"),
  profileId: z.string().min(1, "Inspection profile is required"),
  checklistIds: z.array(z.string()).min(1, "Select at least one checklist item"),
  criticalFields: z.string().optional(),
  reviewerName: z.string().min(1, "Reviewer assignment is required"),
  varianceSensitivity: z.enum(["strict", "standard", "visual_review"], {
    message: "Variance sensitivity is required",
  }),
});

export type InspectionFormValues = z.infer<typeof inspectionFormSchema>;

export const INSPECTION_PROFILES = [
  { id: "profile_medical_device_01", name: "Medical Device Packaging" },
  { id: "profile_pharma_label_01", name: "Pharmaceutical Label" },
  { id: "profile_food_packaging_01", name: "Food & Beverage Packaging" },
  { id: "profile_consumer_goods_01", name: "Consumer Goods" },
  { id: "profile_custom_01", name: "Custom Profile" },
];

export const CHECKLIST_OPTIONS = [
  { id: "chk_text", label: "Text content verification" },
  { id: "chk_barcode", label: "Barcode / QR code validation" },
  { id: "chk_symbols", label: "Regulatory symbols check" },
  { id: "chk_colors", label: "Brand color comparison" },
  { id: "chk_layout", label: "Layout and positioning" },
  { id: "chk_typography", label: "Typography and font weight" },
  { id: "chk_metadata", label: "Document metadata (revision, SKU)" },
  { id: "chk_missing", label: "Missing elements detection" },
];

export const REVIEWERS = [
  { id: "sarah_chen", name: "Sarah Chen" },
  { id: "marcus_webb", name: "Marcus Webb" },
  { id: "jessica_park", name: "Jessica Park" },
  { id: "david_okonkwo", name: "David Okonkwo" },
];

export const VARIANCE_SENSITIVITY_OPTIONS = [
  {
    id: "strict" as const,
    label: "Strict",
    description: "Flag all measurable deviations",
  },
  {
    id: "standard" as const,
    label: "Standard",
    description: "Flag meaningful differences only",
  },
  {
    id: "visual_review" as const,
    label: "Visual Review",
    description: "Focus on visually obvious differences",
  },
];
