import type { HrRecordsActionResult } from "./hr.workforce.records.contract.ts";

export function toRecordsActionFailure(error: unknown): HrRecordsActionResult {
  if (error instanceof Error) {
    return { ok: false, error: error.message };
  }

  return { ok: false, error: "Unexpected records action failure" };
}
