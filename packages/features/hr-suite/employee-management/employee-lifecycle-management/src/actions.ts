import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateEmployeeLifecycleManagementInput,
  EmployeeLifecycleManagementRecord,
  UpdateEmployeeLifecycleManagementInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import { employeeLifecycleManagementStore } from "./queries.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const normalizeName = (value: string): string => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : "Unnamed";
};

export function createEmployeeLifecycleManagementRecord(
  input: CreateEmployeeLifecycleManagementInput,
  _context?: HrSuiteFeatureContext
): EmployeeLifecycleManagementRecord {
  return runHrSuiteFeatureAction(() => {
    const record: EmployeeLifecycleManagementRecord = {
      id: randomUUID(),
      name: normalizeName(input.name),
      status: "draft",
    };

    employeeLifecycleManagementStore.set(record.id, record);
    return record;
  });
}

export function updateEmployeeLifecycleManagementRecord(
  input: UpdateEmployeeLifecycleManagementInput,
  _context?: HrSuiteFeatureContext
): EmployeeLifecycleManagementRecord {
  return runHrSuiteFeatureAction(() => {
    const currentRecord = employeeLifecycleManagementStore.get(input.id);
    const nextRecord: EmployeeLifecycleManagementRecord = {
      id: input.id,
      name: normalizeName(input.name ?? currentRecord?.name ?? "Unnamed"),
      status: input.status ?? currentRecord?.status ?? "draft",
    };

    employeeLifecycleManagementStore.set(nextRecord.id, nextRecord);
    return nextRecord;
  });
}
