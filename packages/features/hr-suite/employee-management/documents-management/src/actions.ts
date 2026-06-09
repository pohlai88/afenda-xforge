import "server-only";

import type {
  CreateDocumentsManagementInput,
  DocumentsManagementRecord,
  UpdateDocumentsManagementInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import type { DocumentsManagementPolicyContext } from "./policy.ts";
import {
  createDocumentsManagementRecordId,
  getDocumentsManagementRepositoryRecord,
  upsertDocumentsManagementRepositoryRecord,
} from "./repository.ts";

const normalizeName = (value: string): string => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : "Unnamed";
};

export function createDocumentsManagementRecord(
  input: CreateDocumentsManagementInput,
  context?: DocumentsManagementPolicyContext
): DocumentsManagementRecord {
  return runHrSuiteFeatureAction(() => {
    const record: DocumentsManagementRecord = {
      id: createDocumentsManagementRecordId(),
      name: normalizeName(input.name),
      status: "draft",
    };

    upsertDocumentsManagementRepositoryRecord(record, context);
    return record;
  }, context);
}

export function updateDocumentsManagementRecord(
  input: UpdateDocumentsManagementInput,
  context?: DocumentsManagementPolicyContext
): DocumentsManagementRecord {
  return runHrSuiteFeatureAction(() => {
    const currentRecord = getDocumentsManagementRepositoryRecord(
      input.id,
      context
    );
    const nextRecord: DocumentsManagementRecord = {
      id: input.id,
      name: normalizeName(input.name ?? currentRecord?.name ?? "Unnamed"),
      status: input.status ?? currentRecord?.status ?? "draft",
    };

    upsertDocumentsManagementRepositoryRecord(nextRecord, context);
    return nextRecord;
  }, context);
}
