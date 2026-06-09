import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateFieldWorkerRemoteWorkforceManagementInput,
  FieldWorkerRemoteWorkforceManagementRecord,
  UpdateFieldWorkerRemoteWorkforceManagementInput,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export async function createFieldWorkerRemoteWorkforceManagementRecord(
  input: CreateFieldWorkerRemoteWorkforceManagementInput,
  _context?: HrSuiteFeatureContext
): Promise<FieldWorkerRemoteWorkforceManagementRecord> {
  return {
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  };
}

export async function updateFieldWorkerRemoteWorkforceManagementRecord(
  input: UpdateFieldWorkerRemoteWorkforceManagementInput,
  _context?: HrSuiteFeatureContext
): Promise<FieldWorkerRemoteWorkforceManagementRecord> {
  return {
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  };
}
