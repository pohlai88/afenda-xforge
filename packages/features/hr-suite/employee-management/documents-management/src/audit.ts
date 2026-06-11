import "server-only";

import type {
  Audit7W1HEvent,
  Audit7W1HEventInput,
  Audit7W1HWriter,
} from "@repo/audit";
import {
  createAuditEvent,
  createDatabaseAuditWriter,
  createNoopAuditWriter,
} from "@repo/audit";

let documentsManagementAuditWriter: Audit7W1HWriter =
  createDatabaseAuditWriter();

export const setDocumentsManagementAuditWriterForTesting = (
  writer: Audit7W1HWriter
): void => {
  documentsManagementAuditWriter = writer;
};

export const resetDocumentsManagementAuditWriterForTesting = (): void => {
  documentsManagementAuditWriter = createNoopAuditWriter();
};

export const restoreDocumentsManagementDatabaseAuditWriter = (): void => {
  documentsManagementAuditWriter = createDatabaseAuditWriter();
};

export async function writeDocumentsManagementAuditEvent(
  input: Audit7W1HEventInput
): Promise<Audit7W1HEvent> {
  const event = createAuditEvent(input);
  await documentsManagementAuditWriter.write(event);
  return event;
}
