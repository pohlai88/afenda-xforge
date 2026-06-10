import "server-only";

import type {
  ListOffboardingCasesQuery,
  OffboardingCaseProjection,
} from "../contracts/index.ts";
import { listOffboardingCasesQuerySchema } from "../contracts/index.ts";
import type { HrSuiteFeatureContext } from "../feature-scope.ts";
import {
  canReadOffboardingCases,
  matchesOffboardingScope,
  requireOffboardingReadScope,
} from "../policy.ts";
import {
  projectOffboardingCase,
  projectOffboardingCases,
} from "../projector/case.ts";
import { loadOffboardingRepository } from "../repository.ts";

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

export async function listOffboardingCases(
  query: ListOffboardingCasesQuery = {},
  context?: HrSuiteFeatureContext
): Promise<readonly OffboardingCaseProjection[]> {
  if (!canReadOffboardingCases(context)) {
    return [];
  }

  const resolvedScope = requireOffboardingReadScope(context);
  const parsedQuery = listOffboardingCasesQuerySchema.parse(query);
  const searchTerm = normalizeSearchTerm(parsedQuery.search);
  const page = normalizePositiveInteger(parsedQuery.page, 1);
  const pageSize = normalizePositiveInteger(
    parsedQuery.pageSize,
    DEFAULT_PAGE_SIZE
  );
  const state = await loadOffboardingRepository(resolvedScope);

  const filteredRecords = state.cases
    .filter((record) => matchesOffboardingScope(record, resolvedScope))
    .filter((record) => {
      if (
        parsedQuery.employeeId !== undefined &&
        record.employeeId !== parsedQuery.employeeId
      ) {
        return false;
      }

      if (
        parsedQuery.status !== undefined &&
        record.status !== parsedQuery.status
      ) {
        return false;
      }

      if (
        parsedQuery.exitType !== undefined &&
        record.exitType !== parsedQuery.exitType
      ) {
        return false;
      }

      if (searchTerm.length === 0) {
        return true;
      }

      return (
        record.id.toLowerCase().includes(searchTerm) ||
        record.caseNumber.toLowerCase().includes(searchTerm) ||
        record.caseTitle.toLowerCase().includes(searchTerm) ||
        record.employeeId.toLowerCase().includes(searchTerm) ||
        record.status.toLowerCase().includes(searchTerm) ||
        record.exitType.toLowerCase().includes(searchTerm) ||
        record.lifecycleTrigger.sourceLifecycleEventId
          .toLowerCase()
          .includes(searchTerm)
      );
    })
    .sort(
      (leftRecord, rightRecord) =>
        rightRecord.createdAt.getTime() - leftRecord.createdAt.getTime() ||
        leftRecord.caseNumber.localeCompare(rightRecord.caseNumber)
    );

  const startIndex = (page - 1) * pageSize;

  return projectOffboardingCases(
    filteredRecords.slice(startIndex, startIndex + pageSize)
  );
}

export async function getOffboardingCaseById(
  id: string,
  context?: HrSuiteFeatureContext
): Promise<OffboardingCaseProjection | null> {
  if (!canReadOffboardingCases(context)) {
    return null;
  }

  const resolvedScope = requireOffboardingReadScope(context);
  const state = await loadOffboardingRepository(resolvedScope);
  const record =
    state.cases.find(
      (entry) =>
        entry.id === id && matchesOffboardingScope(entry, resolvedScope)
    ) ?? null;

  return record ? projectOffboardingCase(record) : null;
}
