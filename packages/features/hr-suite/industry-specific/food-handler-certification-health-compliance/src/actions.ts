import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateFoodHandlerCertificationHealthComplianceInput,
  FoodHandlerCertificationHealthComplianceRecord,
  UpdateFoodHandlerCertificationHealthComplianceInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createFoodHandlerCertificationHealthComplianceRecord(
  input: CreateFoodHandlerCertificationHealthComplianceInput,
  _context?: HrSuiteFeatureContext
): Promise<FoodHandlerCertificationHealthComplianceRecord> {
  return runHrSuiteFeatureAction<
    Promise<FoodHandlerCertificationHealthComplianceRecord>
  >(async () => ({
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  }));
}

export function updateFoodHandlerCertificationHealthComplianceRecord(
  input: UpdateFoodHandlerCertificationHealthComplianceInput,
  _context?: HrSuiteFeatureContext
): Promise<FoodHandlerCertificationHealthComplianceRecord> {
  return runHrSuiteFeatureAction<
    Promise<FoodHandlerCertificationHealthComplianceRecord>
  >(async () => ({
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  }));
}
