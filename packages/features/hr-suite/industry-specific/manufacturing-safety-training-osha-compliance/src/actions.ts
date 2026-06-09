import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateManufacturingSafetyTrainingOshaComplianceInput,
  ManufacturingSafetyTrainingOshaComplianceRecord,
  UpdateManufacturingSafetyTrainingOshaComplianceInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createManufacturingSafetyTrainingOshaComplianceRecord(
  input: CreateManufacturingSafetyTrainingOshaComplianceInput,
  _context?: HrSuiteFeatureContext
): Promise<ManufacturingSafetyTrainingOshaComplianceRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateManufacturingSafetyTrainingOshaComplianceRecord(
  input: UpdateManufacturingSafetyTrainingOshaComplianceInput,
  _context?: HrSuiteFeatureContext
): Promise<ManufacturingSafetyTrainingOshaComplianceRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
