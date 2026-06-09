import "server-only";

import { randomUUID } from "node:crypto";
import type {
  CreateGeolocationRemoteCheckinInput,
  GeolocationRemoteCheckinRecord,
  UpdateGeolocationRemoteCheckinInput,
} from "./contract.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";
import { geolocationRemoteCheckinStore } from "./queries.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

function normalizeName(value: string | undefined): string {
  const trimmedValue = value?.trim() ?? "";
  return trimmedValue.length > 0 ? trimmedValue : "Unnamed";
}

export function createGeolocationRemoteCheckinRecord(
  input: CreateGeolocationRemoteCheckinInput,
  _context?: HrSuiteFeatureContext
): GeolocationRemoteCheckinRecord {
  return runHrSuiteFeatureAction(() => {
    const record: GeolocationRemoteCheckinRecord = {
      id: randomUUID(),
      name: normalizeName(input.name),
      status: "draft",
    };

    geolocationRemoteCheckinStore.set(record.id, record);
    return record;
  });
}

export function updateGeolocationRemoteCheckinRecord(
  input: UpdateGeolocationRemoteCheckinInput,
  _context?: HrSuiteFeatureContext
): GeolocationRemoteCheckinRecord {
  return runHrSuiteFeatureAction(() => {
    const currentRecord = geolocationRemoteCheckinStore.get(input.id);
    const record: GeolocationRemoteCheckinRecord = {
      id: input.id,
      name: normalizeName(input.name ?? currentRecord?.name),
      status: input.status ?? currentRecord?.status ?? "draft",
    };

    geolocationRemoteCheckinStore.set(record.id, record);
    return record;
  });
}
