import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateBonusIncentiveManagementInput,
  BonusIncentiveManagementRecord,
  UpdateBonusIncentiveManagementInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createBonusIncentiveManagementRecord(
  input: CreateBonusIncentiveManagementInput,
  _context?: HrSuiteFeatureContext
): Promise<BonusIncentiveManagementRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateBonusIncentiveManagementRecord(
  input: UpdateBonusIncentiveManagementInput,
  _context?: HrSuiteFeatureContext
): Promise<BonusIncentiveManagementRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
