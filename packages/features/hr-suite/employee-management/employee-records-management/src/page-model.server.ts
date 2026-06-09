import "server-only";

import { buildHrRecordsOverviewStatGroups } from "./overview-stat.surface.ts";
import { listHrEmployeeRecordSummariesPage } from "./queries/records.query.ts";
import type {
  HrEmployeeRecordPageModel,
  HrRecordsPageModelInput,
} from "./records.contract.ts";
import { hrRecordsRoutePaths } from "./route-paths.ts";
import { parseHrRecordsSearchParams } from "./search-params.parse.shared.ts";

type HrRecordsPageModel = HrEmployeeRecordPageModel & {
  overviewStats: readonly {
    key: string;
    stats: readonly {
      id: string;
      label: string;
      value: number;
    }[];
  }[];
};

export function buildHrRecordsPageModel(
  input: HrRecordsPageModelInput
): HrRecordsPageModel {
  const search = parseHrRecordsSearchParams({
    incompleteSearch: input.incompleteSearch,
    directorySearch: input.directorySearch,
    assignmentsSearch: input.assignmentsSearch,
    auditTrailSearch: input.auditTrailSearch,
    statusHistorySearch: input.statusHistorySearch,
    documentReferencesSearch: input.documentReferencesSearch,
    separatedSearch: input.separatedSearch,
    employmentStatusFilter: input.employmentStatusFilter,
  });
  const page = input.page ?? search.page;
  const pageSize = input.pageSize ?? search.pageSize;
  const resolvedSearch = {
    ...search,
    page,
    pageSize,
  };
  const recordsPage = listHrEmployeeRecordSummariesPage(resolvedSearch, {
    canRead: true,
    organizationId: input.organizationId,
  });

  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    canViewSensitive: input.canViewSensitive,
    routePaths: hrRecordsRoutePaths,
    search: resolvedSearch,
    overviewStats: buildHrRecordsOverviewStatGroups(input.organizationId),
    records: recordsPage.records,
    page: recordsPage.page,
    pageSize: recordsPage.pageSize,
    totalCount: recordsPage.totalCount,
    hasNextPage: recordsPage.hasNextPage,
  } satisfies HrRecordsPageModel;
}
