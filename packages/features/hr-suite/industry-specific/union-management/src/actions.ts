import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateUnionManagementInput,
  UnionManagementRecord,
  UpdateUnionManagementInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createUnionManagementRecord(
  input: CreateUnionManagementInput,
  _context?: HrSuiteFeatureContext
): Promise<UnionManagementRecord> {
  return runHrSuiteFeatureAction<Promise<UnionManagementRecord>>(async () => ({
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  }));
}

export function updateUnionManagementRecord(
  input: UpdateUnionManagementInput,
  _context?: HrSuiteFeatureContext
): Promise<UnionManagementRecord> {
  return runHrSuiteFeatureAction<Promise<UnionManagementRecord>>(async () => ({
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  }));
}
