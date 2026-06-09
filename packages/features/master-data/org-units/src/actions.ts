import "server-only";

import type { CreateOrgUnitBody, OrgUnit } from "./contract.ts";
import { runOrgUnitAction } from "./execution/index.ts";
import { createOrgUnitRecord } from "./store.ts";

export const createOrgUnit = (input: CreateOrgUnitBody): OrgUnit =>
  runOrgUnitAction(createOrgUnitRecord(input));
