import "server-only";

import {
  canReadLamAttendanceCorrections,
  canReadLamAuditTrail,
  canReadLamPayrollReferences,
  canReadLamReports,
  canReadLeaveAttendanceManagement,
  canReadLeaveAttendanceManagementSensitiveData,
} from "../policy.ts";
import type { LamReadContext } from "../schema.ts";

export const DEFAULT_PAGE_SIZE = 25;

export const normalizeSearchTerm = (value: string | undefined): string =>
  value?.trim().toLowerCase() ?? "";

export const normalizePage = (value: number | undefined): number =>
  Number.isFinite(value) && value && value > 0 ? Math.floor(value) : 1;

export const normalizePageSize = (value: number | undefined): number =>
  Number.isFinite(value) && value && value > 0
    ? Math.min(Math.floor(value), 500)
    : DEFAULT_PAGE_SIZE;

export const paginate = <T>(
  items: readonly T[],
  page?: number,
  pageSize?: number
): T[] => {
  const normalizedPage = normalizePage(page);
  const normalizedPageSize = normalizePageSize(pageSize);
  const startIndex = (normalizedPage - 1) * normalizedPageSize;
  return items.slice(startIndex, startIndex + normalizedPageSize);
};

export const matchesSearch = (
  haystacks: readonly (string | null | undefined)[],
  term: string
): boolean =>
  term.length === 0
    ? true
    : haystacks.some((value) => value?.toLowerCase().includes(term));

export const readContext = (
  context?: LamReadContext
): {
  canRead: boolean;
  canViewSensitive: boolean;
  companyId?: string;
  tenantId?: string;
} => ({
  canRead: canReadLeaveAttendanceManagement(context ?? {}),
  canViewSensitive: canReadLeaveAttendanceManagementSensitiveData(
    context ?? {}
  ),
  companyId: context?.companyId,
  tenantId: context?.tenantId,
});

export const readAttendanceCorrectionsContext = (
  context?: LamReadContext
): {
  canRead: boolean;
  companyId?: string;
  tenantId?: string;
} => ({
  canRead: canReadLamAttendanceCorrections(context ?? {}),
  companyId: context?.companyId,
  tenantId: context?.tenantId,
});

export const readPayrollReferencesContext = (
  context?: LamReadContext
): {
  canRead: boolean;
  companyId?: string;
  tenantId?: string;
} => ({
  canRead: canReadLamPayrollReferences(context ?? {}),
  companyId: context?.companyId,
  tenantId: context?.tenantId,
});

export const readReportsContext = (
  context?: LamReadContext
): {
  canRead: boolean;
  companyId?: string;
  tenantId?: string;
} => ({
  canRead: canReadLamReports(context ?? {}),
  companyId: context?.companyId,
  tenantId: context?.tenantId,
});

export const readAuditTrailContext = (
  context?: LamReadContext
): {
  canRead: boolean;
  canViewSensitive: boolean;
  companyId?: string;
  tenantId?: string;
} => ({
  canRead: canReadLamAuditTrail(context ?? {}),
  canViewSensitive: canReadLeaveAttendanceManagementSensitiveData(
    context ?? {}
  ),
  companyId: context?.companyId,
  tenantId: context?.tenantId,
});

export {
  canAccessLamEmployeeRecord,
  filterByEmployeeDataScope,
  resolveLamDataScope,
} from "../policy.ts";

export const filterByCompany = <
  T extends { companyId?: string | null | undefined },
>(
  items: readonly T[],
  companyId?: string
): T[] =>
  companyId
    ? items.filter((entry) => entry.companyId === companyId)
    : [...items];
