import "server-only";

import type {
  ListOffboardingApprovalBlockersQuery,
  ListOffboardingApprovalStepsQuery,
  ListOffboardingAuditTrailQuery,
  ListOffboardingCasesQuery,
  OffboardingApprovalBlockerProjection,
  OffboardingApprovalProjection,
  OffboardingAuditTrailProjection,
  OffboardingCaseProjection,
  OffboardingFoundationSnapshot,
} from "./contracts/index.ts";
import {
  listOffboardingApprovalBlockersQuerySchema,
  listOffboardingApprovalStepsQuerySchema,
  listOffboardingAuditTrailQuerySchema,
  listOffboardingCasesQuerySchema,
} from "./contracts/index.ts";
import type { HrSuiteFeatureContext } from "./feature-scope.ts";
import {
  projectOffboardingApprovalBlockers,
  projectOffboardingApprovalRecords,
  projectOffboardingAuditTrailEntries,
  projectOffboardingCaseRecords,
  projectOffboardingFoundationSnapshot,
} from "./projector.ts";

const DEFAULT_PAGE_SIZE = 25;

const normalizePositiveInteger = (
  value: number | undefined,
  fallback: number
): number => {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  const parsedValue = Math.floor(value);
  return parsedValue > 0 ? parsedValue : fallback;
};

const normalizeSearchTerm = (value: string | undefined): string =>
  value?.trim().toLowerCase() ?? "";

const paginate = <T>(
  entries: readonly T[],
  page: number,
  pageSize: number
): readonly T[] => {
  const startIndex = (page - 1) * pageSize;
  return entries.slice(startIndex, startIndex + pageSize);
};

const matchesOffboardingCaseQuery = (
  entry: OffboardingCaseProjection,
  query: ListOffboardingCasesQuery,
  searchTerm: string
): boolean => {
  if (query.employeeId && entry.employeeId !== query.employeeId) {
    return false;
  }

  if (query.exitType && entry.exitType !== query.exitType) {
    return false;
  }

  if (query.status && entry.status !== query.status) {
    return false;
  }

  if (
    query.legalEntityCode &&
    entry.legalEntityCode !== query.legalEntityCode
  ) {
    return false;
  }

  if (query.departmentId && entry.departmentId !== query.departmentId) {
    return false;
  }

  if (searchTerm.length === 0) {
    return true;
  }

  return (
    entry.id.toLowerCase().includes(searchTerm) ||
    entry.employeeId.toLowerCase().includes(searchTerm) ||
    entry.exitType.toLowerCase().includes(searchTerm) ||
    entry.status.toLowerCase().includes(searchTerm) ||
    (entry.legalEntityCode ?? "").toLowerCase().includes(searchTerm) ||
    (entry.departmentId ?? "").toLowerCase().includes(searchTerm) ||
    (entry.reason ?? "").toLowerCase().includes(searchTerm)
  );
};

const matchesApprovalQuery = (
  entry: OffboardingApprovalProjection,
  query: ListOffboardingApprovalStepsQuery,
  searchTerm: string
): boolean => {
  if (query.caseId && entry.caseId !== query.caseId) {
    return false;
  }

  if (query.employeeId && entry.employeeId !== query.employeeId) {
    return false;
  }

  if (query.exitType && entry.exitType !== query.exitType) {
    return false;
  }

  if (query.status && entry.status !== query.status) {
    return false;
  }

  if (query.required !== undefined && entry.required !== query.required) {
    return false;
  }

  if (query.routeToId && entry.routeToId !== query.routeToId) {
    return false;
  }

  if (searchTerm.length === 0) {
    return true;
  }

  return (
    entry.id.toLowerCase().includes(searchTerm) ||
    entry.caseId.toLowerCase().includes(searchTerm) ||
    entry.employeeId.toLowerCase().includes(searchTerm) ||
    entry.stepCode.toLowerCase().includes(searchTerm) ||
    entry.stepLabel.toLowerCase().includes(searchTerm) ||
    entry.status.toLowerCase().includes(searchTerm) ||
    entry.routeToId.toLowerCase().includes(searchTerm) ||
    (entry.routeToLabel ?? "").toLowerCase().includes(searchTerm)
  );
};

const matchesApprovalBlockerQuery = (
  entry: OffboardingApprovalBlockerProjection,
  query: ListOffboardingApprovalBlockersQuery
): boolean => {
  if (query.caseId && entry.caseId !== query.caseId) {
    return false;
  }

  if (query.employeeId && entry.employeeId !== query.employeeId) {
    return false;
  }

  return true;
};

const matchesOffboardingAuditTrailQuery = (
  entry: OffboardingAuditTrailProjection,
  query: ListOffboardingAuditTrailQuery,
  searchTerm: string
): boolean => {
  if (query.action && entry.action !== query.action) {
    return false;
  }

  if (query.entityType && entry.entityType !== query.entityType) {
    return false;
  }

  if (searchTerm.length === 0) {
    return true;
  }

  return (
    entry.action.toLowerCase().includes(searchTerm) ||
    entry.entityType.toLowerCase().includes(searchTerm) ||
    entry.entityId.toLowerCase().includes(searchTerm) ||
    (entry.summary ?? "").toLowerCase().includes(searchTerm)
  );
};

export async function getOffboardingFoundationSnapshot(
  context?: HrSuiteFeatureContext
): Promise<OffboardingFoundationSnapshot | null> {
  return await projectOffboardingFoundationSnapshot(
    {
      companyId: context?.companyId,
      tenantId: context?.tenantId,
    },
    context
  );
}

export async function listOffboardingCaseRecords(
  query: ListOffboardingCasesQuery = {},
  context?: HrSuiteFeatureContext
): Promise<readonly OffboardingCaseProjection[]> {
  const parsedQuery = listOffboardingCasesQuerySchema.parse(query);
  const searchTerm = normalizeSearchTerm(parsedQuery.search);
  const page = normalizePositiveInteger(parsedQuery.page, 1);
  const pageSize = normalizePositiveInteger(
    parsedQuery.pageSize,
    DEFAULT_PAGE_SIZE
  );

  const entries = (
    await projectOffboardingCaseRecords(
      {
        companyId: context?.companyId ?? parsedQuery.companyId,
        tenantId: context?.tenantId,
      },
      context
    )
  ).filter((entry) =>
    matchesOffboardingCaseQuery(entry, parsedQuery, searchTerm)
  );

  return paginate(entries, page, pageSize);
}

export async function getOffboardingCaseById(
  caseId: string,
  context?: HrSuiteFeatureContext
): Promise<OffboardingCaseProjection | null> {
  const entries = await projectOffboardingCaseRecords(
    {
      companyId: context?.companyId,
      tenantId: context?.tenantId,
    },
    context
  );

  return entries.find((entry) => entry.id === caseId) ?? null;
}

export async function listOffboardingApprovalRecords(
  query: ListOffboardingApprovalStepsQuery = {},
  context?: HrSuiteFeatureContext
): Promise<readonly OffboardingApprovalProjection[]> {
  const parsedQuery = listOffboardingApprovalStepsQuerySchema.parse(query);
  const searchTerm = normalizeSearchTerm(parsedQuery.search);
  const page = normalizePositiveInteger(parsedQuery.page, 1);
  const pageSize = normalizePositiveInteger(
    parsedQuery.pageSize,
    DEFAULT_PAGE_SIZE
  );

  const entries = (
    await projectOffboardingApprovalRecords(
      {
        companyId: context?.companyId ?? parsedQuery.companyId,
        tenantId: context?.tenantId,
      },
      context
    )
  ).filter((entry) => matchesApprovalQuery(entry, parsedQuery, searchTerm));

  return paginate(entries, page, pageSize);
}

export async function getOffboardingApprovalById(
  approvalId: string,
  context?: HrSuiteFeatureContext
): Promise<OffboardingApprovalProjection | null> {
  const entries = await projectOffboardingApprovalRecords(
    {
      companyId: context?.companyId,
      tenantId: context?.tenantId,
    },
    context
  );

  return entries.find((entry) => entry.id === approvalId) ?? null;
}

export async function listOffboardingApprovalBlockers(
  query: ListOffboardingApprovalBlockersQuery = {},
  context?: HrSuiteFeatureContext
): Promise<readonly OffboardingApprovalBlockerProjection[]> {
  const parsedQuery = listOffboardingApprovalBlockersQuerySchema.parse(query);

  return (
    await projectOffboardingApprovalBlockers(
      {
        companyId: context?.companyId ?? parsedQuery.companyId,
        tenantId: context?.tenantId,
      },
      context
    )
  ).filter((entry) => matchesApprovalBlockerQuery(entry, parsedQuery));
}

export async function listOffboardingAuditTrailRecords(
  query: ListOffboardingAuditTrailQuery = {},
  context?: HrSuiteFeatureContext
): Promise<readonly OffboardingAuditTrailProjection[]> {
  const parsedQuery = listOffboardingAuditTrailQuerySchema.parse(query);
  const searchTerm = normalizeSearchTerm(parsedQuery.search);
  const page = normalizePositiveInteger(parsedQuery.page, 1);
  const pageSize = normalizePositiveInteger(
    parsedQuery.pageSize,
    DEFAULT_PAGE_SIZE
  );

  const entries = (
    await projectOffboardingAuditTrailEntries(
      {
        companyId: context?.companyId ?? parsedQuery.companyId,
        tenantId: context?.tenantId,
      },
      context
    )
  ).filter((entry) =>
    matchesOffboardingAuditTrailQuery(entry, parsedQuery, searchTerm)
  );

  return paginate(entries, page, pageSize);
}
