import type { DeadLetterRecord } from "./contract.ts";

export type DeadLetterSearch = Readonly<{
  eventType?: string;
  provider?: string;
  replayStatus?: DeadLetterRecord["replayStatus"];
  tenantId?: string;
}>;

export const matchesDeadLetterSearch = (
  record: DeadLetterRecord,
  search: DeadLetterSearch
): boolean => {
  if (search.provider && record.provider !== search.provider) {
    return false;
  }

  if (search.eventType && record.envelope.eventType !== search.eventType) {
    return false;
  }

  if (search.replayStatus && record.replayStatus !== search.replayStatus) {
    return false;
  }

  if (search.tenantId && record.envelope.tenantId !== search.tenantId) {
    return false;
  }

  return true;
};
