import "server-only";

import { randomUUID } from "node:crypto";
import type {
  BonusIncentiveManagementRecord,
  CreateBonusIncentiveManagementInput,
  UpdateBonusIncentiveManagementInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createBonusIncentiveManagementRecord(
  input: CreateBonusIncentiveManagementInput,
  _context?: HrSuiteFeatureContext
): Promise<BonusIncentiveManagementRecord> {
  return runHrSuiteFeatureAction<Promise<BonusIncentiveManagementRecord>>(
    async () => ({
      id: randomUUID(),
      name: input.name.trim(),
      status: "draft",
    })
  );
}

export function updateBonusIncentiveManagementRecord(
  input: UpdateBonusIncentiveManagementInput,
  _context?: HrSuiteFeatureContext
): Promise<BonusIncentiveManagementRecord> {
  return runHrSuiteFeatureAction<Promise<BonusIncentiveManagementRecord>>(
    async () => ({
      id: input.id,
      name: input.name?.trim() || "Unnamed",
      status: input.status ?? "draft",
    })
  );
}
