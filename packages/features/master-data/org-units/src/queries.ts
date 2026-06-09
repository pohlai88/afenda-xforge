import "server-only";

import type { ListOrgUnitsQuery, OrgUnitList } from "./contract.ts";
import { listOrgUnitRecords } from "./store.ts";

export const listOrgUnits = (query: ListOrgUnitsQuery): OrgUnitList =>
  listOrgUnitRecords(query);
