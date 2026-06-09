import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateDocumentsManagementInput,
  DocumentsManagementRecord,
  UpdateDocumentsManagementInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import { documentsManagementStore } from "./queries.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

const normalizeName = (value: string): string => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : "Unnamed";
};

export function createDocumentsManagementRecord(
  input: CreateDocumentsManagementInput,
  _context?: HrSuiteFeatureContext
): DocumentsManagementRecord {
  return runHrSuiteFeatureAction(() => {
    const record: DocumentsManagementRecord = {
      id: randomUUID(),
      name: normalizeName(input.name),
      status: "draft",
    };

    documentsManagementStore.set(record.id, record);
    return record;
  });
}

export function updateDocumentsManagementRecord(
  input: UpdateDocumentsManagementInput,
  _context?: HrSuiteFeatureContext
): DocumentsManagementRecord {
  return runHrSuiteFeatureAction(() => {
    const currentRecord = documentsManagementStore.get(input.id);
    const nextRecord: DocumentsManagementRecord = {
      id: input.id,
      name: normalizeName(input.name ?? currentRecord?.name ?? "Unnamed"),
      status: input.status ?? currentRecord?.status ?? "draft",
    };

    documentsManagementStore.set(nextRecord.id, nextRecord);
    return nextRecord;
  });
}
