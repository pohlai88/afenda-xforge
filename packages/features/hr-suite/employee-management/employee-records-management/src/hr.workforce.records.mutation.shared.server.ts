import "server-only";

import type { HrRecordsActionResult } from "./hr.workforce.records.contract.ts";

export type RecordsMutationAudit = {
  organizationId: string;
  actorId: string;
  action: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  summary?: string;
  reason?: string;
};

export async function finalizeRecordsMutation(
  _organizationId: string,
  mutate: () => Promise<RecordsMutationAudit>,
  _options?: { employeeId?: string }
): Promise<HrRecordsActionResult> {
  try {
    await mutate();
    return { ok: true };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Unexpected mutation failure" };
  }
}
