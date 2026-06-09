import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateFoodHandlerCertificationHealthComplianceInput,
  FoodHandlerCertificationHealthComplianceRecord,
  UpdateFoodHandlerCertificationHealthComplianceInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createFoodHandlerCertificationHealthComplianceRecord(
  input: CreateFoodHandlerCertificationHealthComplianceInput,
  _context?: HrSuiteFeatureContext
): Promise<FoodHandlerCertificationHealthComplianceRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateFoodHandlerCertificationHealthComplianceRecord(
  input: UpdateFoodHandlerCertificationHealthComplianceInput,
  _context?: HrSuiteFeatureContext
): Promise<FoodHandlerCertificationHealthComplianceRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
