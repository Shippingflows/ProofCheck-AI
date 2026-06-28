import { ComparisonEngine } from "@/domain/comparison-engine";
import { DeterministicEngine } from "./deterministic-engine";
import { DemoEngine } from "./demo-engine";

export type EngineType = "deterministic" | "demo";

/**
 * Factory for creating comparison engine instances.
 * The demo engine is preserved as a fallback for prototype mode.
 */
export function createEngine(type: EngineType = "deterministic"): ComparisonEngine {
  switch (type) {
    case "demo":
      return new DemoEngine();
    case "deterministic":
    default:
      return new DeterministicEngine();
  }
}

export { DeterministicEngine } from "./deterministic-engine";
export { DemoEngine } from "./demo-engine";
export {
  runCriticalFieldChecks,
  extractFieldValue,
  normalizeFieldValue,
  matchFieldValues,
  computeConfidence,
  getFieldSpecsForProfile,
  MEDICAL_DEVICE_FIELDS,
  type CriticalFieldSpec,
  type CriticalFieldResult,
  type CriticalFieldCheckInput,
  type CriticalFieldCheckOutput,
  type PageComparisonSummary,
  type FieldEvidence,
  type MatchMode,
} from "./critical-fields";
