import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateOffboardingExitManagementInput,
  OffboardingExitManagementRecord,
  UpdateOffboardingExitManagementInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import { offboardingExitManagementStore } from "./queries.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const normalizeName = (value: string): string => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : "Unnamed";
};

export function createOffboardingExitManagementRecord(
  input: CreateOffboardingExitManagementInput,
  _context?: HrSuiteFeatureContext
): OffboardingExitManagementRecord {
  return runHrSuiteFeatureAction(() => {
    const record: OffboardingExitManagementRecord = {
      id: randomUUID(),
      name: normalizeName(input.name),
      status: "draft",
    };

    offboardingExitManagementStore.set(record.id, record);
    return record;
  });
}

export function updateOffboardingExitManagementRecord(
  input: UpdateOffboardingExitManagementInput,
  _context?: HrSuiteFeatureContext
): OffboardingExitManagementRecord {
  return runHrSuiteFeatureAction(() => {
    const currentRecord = offboardingExitManagementStore.get(input.id);
    const nextRecord: OffboardingExitManagementRecord = {
      id: input.id,
      name: normalizeName(input.name ?? currentRecord?.name ?? "Unnamed"),
      status: input.status ?? currentRecord?.status ?? "draft",
    };

    offboardingExitManagementStore.set(nextRecord.id, nextRecord);
    return nextRecord;
  });
}
