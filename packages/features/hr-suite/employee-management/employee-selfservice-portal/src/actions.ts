import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateEmployeeSelfservicePortalInput,
  EmployeeSelfservicePortalRecord,
  UpdateEmployeeSelfservicePortalInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import { employeeSelfservicePortalStore } from "./queries.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const normalizeName = (value: string): string => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : "Unnamed";
};

export function createEmployeeSelfservicePortalRecord(
  input: CreateEmployeeSelfservicePortalInput,
  _context?: HrSuiteFeatureContext
): EmployeeSelfservicePortalRecord {
  return runHrSuiteFeatureAction(() => {
    const record: EmployeeSelfservicePortalRecord = {
      id: randomUUID(),
      name: normalizeName(input.name),
      status: "draft",
    };

    employeeSelfservicePortalStore.set(record.id, record);
    return record;
  });
}

export function updateEmployeeSelfservicePortalRecord(
  input: UpdateEmployeeSelfservicePortalInput,
  _context?: HrSuiteFeatureContext
): EmployeeSelfservicePortalRecord {
  return runHrSuiteFeatureAction(() => {
    const currentRecord = employeeSelfservicePortalStore.get(input.id);
    const nextRecord: EmployeeSelfservicePortalRecord = {
      id: input.id,
      name: normalizeName(input.name ?? currentRecord?.name ?? "Unnamed"),
      status: input.status ?? currentRecord?.status ?? "draft",
    };

    employeeSelfservicePortalStore.set(nextRecord.id, nextRecord);
    return nextRecord;
  });
}
