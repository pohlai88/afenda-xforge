import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateFieldWorkerRemoteWorkforceManagementInput,
  FieldWorkerRemoteWorkforceManagementRecord,
  UpdateFieldWorkerRemoteWorkforceManagementInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export function createFieldWorkerRemoteWorkforceManagementRecord(
  input: CreateFieldWorkerRemoteWorkforceManagementInput,
  _context?: HrSuiteFeatureContext
): Promise<FieldWorkerRemoteWorkforceManagementRecord> {
  return runHrSuiteFeatureAction<
    Promise<FieldWorkerRemoteWorkforceManagementRecord>
  >(async () => ({
    id: randomUUID(),
    name: input.name.trim(),
    status: "draft",
  }));
}

export function updateFieldWorkerRemoteWorkforceManagementRecord(
  input: UpdateFieldWorkerRemoteWorkforceManagementInput,
  _context?: HrSuiteFeatureContext
): Promise<FieldWorkerRemoteWorkforceManagementRecord> {
  return runHrSuiteFeatureAction<
    Promise<FieldWorkerRemoteWorkforceManagementRecord>
  >(async () => ({
    id: input.id,
    name: input.name?.trim() || "Unnamed",
    status: input.status ?? "draft",
  }));
}
