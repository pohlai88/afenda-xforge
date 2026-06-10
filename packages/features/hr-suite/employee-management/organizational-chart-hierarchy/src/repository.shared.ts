import "server-only";

import { randomUUID } from "node:crypto";
import type {
  HrOrgAuditEvent,
  HrOrgPositionRecord,
  HrOrgReportingRelationshipRecord,
  HrOrgUnitRecord,
} from "./contracts/domain.contract.ts";

export type HrOrgRepositoryScope = {
  companyId?: string | null;
  tenantId?: string | null;
};

export type HrOrgRepositoryResolvedScope = {
  companyId: string;
  tenantId: string;
};

export type HrOrgRepositoryState = {
  auditEvents: HrOrgAuditEvent[];
  positions: HrOrgPositionRecord[];
  reportingRelationships: HrOrgReportingRelationshipRecord[];
  units: HrOrgUnitRecord[];
};

export const emptyState = (): HrOrgRepositoryState => ({
  auditEvents: [],
  positions: [],
  reportingRelationships: [],
  units: [],
});

export const emptyHrOrgRepositoryState: () => HrOrgRepositoryState = emptyState;

export const cloneState = (state: HrOrgRepositoryState): HrOrgRepositoryState =>
  structuredClone(state);

const normalizeScopeValue = (
  value: string | null | undefined
): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export const normalizeScope = (
  scope?: HrOrgRepositoryScope
): HrOrgRepositoryScope => ({
  companyId:
    scope?.companyId === undefined
      ? undefined
      : normalizeScopeValue(scope.companyId),
  tenantId:
    scope?.tenantId === undefined
      ? undefined
      : normalizeScopeValue(scope.tenantId),
});

export const resolveRepositoryScope = (
  scope?: HrOrgRepositoryScope
): HrOrgRepositoryResolvedScope | null => {
  const tenantId = normalizeScopeValue(scope?.tenantId);
  const companyId = normalizeScopeValue(scope?.companyId);

  if (!(tenantId && companyId)) {
    return null;
  }

  return { companyId, tenantId };
};

export const shouldUseDatabaseRepository = (
  scope?: HrOrgRepositoryScope
): boolean =>
  process.env.AFENDA_ORGANIZATIONAL_CHART_HIERARCHY_REPOSITORY_MODE !==
    "file" &&
  Boolean(process.env.DATABASE_URL) &&
  resolveRepositoryScope(scope) !== null;

export const createHrOrgRecordId = (): string => randomUUID();
