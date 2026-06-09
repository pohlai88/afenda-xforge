import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateUnionManagementInput,
  UnionManagementRecord,
  UpdateUnionManagementInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createUnionManagementRecord(
  input: CreateUnionManagementInput,
  _context?: HrSuiteFeatureContext
): Promise<UnionManagementRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateUnionManagementRecord(
  input: UpdateUnionManagementInput,
  _context?: HrSuiteFeatureContext
): Promise<UnionManagementRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
