import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateManufacturingSafetyTrainingOshaComplianceInput,
  ManufacturingSafetyTrainingOshaComplianceRecord,
  UpdateManufacturingSafetyTrainingOshaComplianceInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createManufacturingSafetyTrainingOshaComplianceRecord(
  input: CreateManufacturingSafetyTrainingOshaComplianceInput,
  _context?: HrSuiteFeatureContext
): Promise<ManufacturingSafetyTrainingOshaComplianceRecord> {
  return runHrSuiteFeatureAction<
    Promise<ManufacturingSafetyTrainingOshaComplianceRecord>
  >(async () => ({
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  }));
}

export function updateManufacturingSafetyTrainingOshaComplianceRecord(
  input: UpdateManufacturingSafetyTrainingOshaComplianceInput,
  _context?: HrSuiteFeatureContext
): Promise<ManufacturingSafetyTrainingOshaComplianceRecord> {
  return runHrSuiteFeatureAction<
    Promise<ManufacturingSafetyTrainingOshaComplianceRecord>
  >(async () => ({
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  }));
}
