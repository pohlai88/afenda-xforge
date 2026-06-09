import "server-only";

import type { JobPositionList, ListJobPositionsQuery } from "./contract.ts";
import { listJobPositionRecords } from "./store.ts";

export const listJobPositions = (
  query: ListJobPositionsQuery
): JobPositionList => listJobPositionRecords(query);
