import type { HrRecordsActionResult } from "./records.contract.ts";

export function toHrRecordsActionFailure(
  error: unknown
): HrRecordsActionResult {
  if (error instanceof Error) {
    return { ok: false, error: error.message };
  }

  return { ok: false, error: "Unexpected records action failure" };
}
