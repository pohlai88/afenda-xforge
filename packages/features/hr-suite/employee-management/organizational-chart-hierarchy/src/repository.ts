import "server-only";

import { randomUUID } from "node:crypto";
import type {
  HrOrgAuditEvent,
  HrOrgPositionRecord,
  HrOrgReportingRelationshipRecord,
  HrOrgUnitRecord,
} from "./contracts/index.ts";

export type HrOrgRepositoryScope = {
  companyId?: string | null;
  tenantId?: string | null;
};

export type HrOrgRepositoryState = {
  auditEvents: HrOrgAuditEvent[];
  positions: HrOrgPositionRecord[];
  reportingRelationships: HrOrgReportingRelationshipRecord[];
  units: HrOrgUnitRecord[];
};

export const emptyHrOrgRepositoryState = (): HrOrgRepositoryState => ({
  auditEvents: [],
  positions: [],
  reportingRelationships: [],
  units: [],
});

let inMemoryState = emptyHrOrgRepositoryState();

const cloneState = (state: HrOrgRepositoryState): HrOrgRepositoryState =>
  structuredClone(state);

export const resetHrOrgRepositoryForTesting = async (): Promise<void> => {
  inMemoryState = emptyHrOrgRepositoryState();
  await Promise.resolve();
};

export const loadHrOrgRepository = async (
  _scope?: HrOrgRepositoryScope
): Promise<HrOrgRepositoryState> => cloneState(inMemoryState);

export const saveHrOrgRepository = async (
  nextState: HrOrgRepositoryState,
  _scope?: HrOrgRepositoryScope
): Promise<void> => {
  inMemoryState = cloneState(nextState);
  await Promise.resolve();
};

export const mutateHrOrgRepository = async (
  updater: (draft: HrOrgRepositoryState) => void,
  scope?: HrOrgRepositoryScope
): Promise<HrOrgRepositoryState> => {
  const nextState = await loadHrOrgRepository(scope);
  updater(nextState);
  await saveHrOrgRepository(nextState, scope);
  return loadHrOrgRepository(scope);
};

export const createHrOrgRecordId = (): string => randomUUID();
