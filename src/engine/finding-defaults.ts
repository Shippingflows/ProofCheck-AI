import { Finding } from "@/domain/models";

/** Default extended fields for engine-generated findings. */
export const ENGINE_FINDING_DEFAULTS: Pick<
  Finding,
  | "detectionMethod"
  | "recommendedAction"
  | "masterEvidenceSrc"
  | "supplierEvidenceSrc"
> = {
  detectionMethod: "Automated text comparison",
  recommendedAction: "Review and confirm with approved master",
  masterEvidenceSrc: null,
  supplierEvidenceSrc: null,
};
