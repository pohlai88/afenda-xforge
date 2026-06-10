import "server-only";

import { listComplianceRequirementsRecords } from "../../../compliance-regulatory-tracking/src/server.ts";
import { listDocumentsManagementPolicyAcknowledgmentSummaries } from "../../../documents-management/src/server.ts";
import { listEmployeeLifecycleTaskEntries } from "../../../employee-lifecycle-management/src/server.ts";
import { listOffboardingCaseRecords } from "../../../offboarding-exit-management/src/server.ts";
import { canReadEmployeeSelfservicePortal } from "../policy.ts";
import {
  projectEmployeeSelfservicePortalAcknowledgmentTask,
  projectEmployeeSelfservicePortalComplianceTask,
  projectEmployeeSelfservicePortalLifecycleTask,
  projectEmployeeSelfservicePortalOffboardingTask,
  projectEmployeeSelfservicePortalRequestTask,
} from "../projector/task.ts";
import { listEmployeeSelfservicePortalProfileUpdateRequestViews } from "../queries/profile-update-requests.query.ts";
import { listEmployeeSelfservicePortalRepositoryRecords } from "../repository.ts";
import type {
  EmployeeSelfservicePortalTaskItem,
  ListEmployeeSelfservicePortalTasksQuery,
} from "../schema.ts";
import { listEmployeeSelfservicePortalTasksQuerySchema } from "../schema.ts";
import type { HrSuiteFeatureContext } from "../shared/index.ts";

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

const hasAccessiblePortalRecord = (
  context: HrSuiteFeatureContext | undefined
): boolean =>
  Boolean(
    context?.actorEmployeeId &&
      listEmployeeSelfservicePortalRepositoryRecords().some(
        (record) =>
          record.employeeId === context.actorEmployeeId &&
          canReadEmployeeSelfservicePortal(context, record)
      )
  );

const matchesSearch = (
  task: EmployeeSelfservicePortalTaskItem,
  searchTerm: string
): boolean => {
  if (searchTerm.length === 0) {
    return true;
  }

  return [
    task.category,
    task.source,
    task.status,
    task.summary,
    task.title,
  ].some((value) => value.toLowerCase().includes(searchTerm));
};

export async function listEmployeeSelfservicePortalTasks(
  query: ListEmployeeSelfservicePortalTasksQuery = {},
  context?: HrSuiteFeatureContext
): Promise<readonly EmployeeSelfservicePortalTaskItem[]> {
  const parsedQuery =
    listEmployeeSelfservicePortalTasksQuerySchema.parse(query);

  if (
    !(
      context?.canRead &&
      context.actorEmployeeId &&
      hasAccessiblePortalRecord(context)
    )
  ) {
    return [];
  }

  const employeeId = context.actorEmployeeId;
  const page = normalizePositiveInteger(parsedQuery.page, 1);
  const pageSize = normalizePositiveInteger(
    parsedQuery.pageSize,
    DEFAULT_PAGE_SIZE
  );
  const searchTerm = normalizeSearchTerm(parsedQuery.search);

  const [
    lifecycleTasks,
    complianceRequirements,
    acknowledgments,
    offboardingCases,
  ] = await Promise.all([
    Promise.resolve(
      listEmployeeLifecycleTaskEntries(
        employeeId,
        {
          companyId: context.companyId,
          tenantId: context.tenantId,
        },
        {
          canRead: true,
          canViewSensitive: false,
          companyId: context.companyId,
        }
      )
    ),
    listComplianceRequirementsRecords(
      {
        employeeId,
      },
      {
        canRead: true,
        companyId: context.companyId,
      }
    ),
    Promise.resolve(
      listDocumentsManagementPolicyAcknowledgmentSummaries(
        {
          acknowledgmentStatus: "pending",
          employeeId,
        },
        {
          actorEmployeeId: employeeId,
          actorId: context.actorId,
          canDownload: false,
          canRead: true,
          canSelfAcknowledge: true,
          canViewSensitive: false,
          companyId: context.companyId,
          organizationId: context.organizationId,
          requestId: context.requestId,
          tenantId: context.tenantId,
          userId: context.userId,
        }
      )
    ),
    listOffboardingCaseRecords(
      {
        employeeId,
      },
      {
        canRead: true,
        companyId: context.companyId,
        tenantId: context.tenantId,
      }
    ),
  ]);

  const requestTasks = listEmployeeSelfservicePortalProfileUpdateRequestViews(
    {
      employeeId,
    },
    context
  ).filter(
    (entry) =>
      entry.status === "pending_hr_review" || entry.status === "rejected"
  );

  const tasks = [
    ...lifecycleTasks
      .filter((entry) => entry.status !== "completed")
      .map(projectEmployeeSelfservicePortalLifecycleTask),
    ...offboardingCases
      .filter((entry) => entry.status !== "completed")
      .map(projectEmployeeSelfservicePortalOffboardingTask),
    ...complianceRequirements
      .filter(
        (entry) => entry.status !== "compliant" && entry.status !== "waived"
      )
      .map(projectEmployeeSelfservicePortalComplianceTask),
    ...acknowledgments.map(projectEmployeeSelfservicePortalAcknowledgmentTask),
    ...requestTasks.map(projectEmployeeSelfservicePortalRequestTask),
  ]
    .filter((task) =>
      parsedQuery.category ? task.category === parsedQuery.category : true
    )
    .filter((task) =>
      parsedQuery.status ? task.status === parsedQuery.status : true
    )
    .filter((task) => matchesSearch(task, searchTerm))
    .sort(
      (left, right) =>
        (left.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER) -
          (right.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER) ||
        right.updatedAt.getTime() - left.updatedAt.getTime() ||
        left.title.localeCompare(right.title)
    );

  const startIndex = (page - 1) * pageSize;
  return tasks.slice(startIndex, startIndex + pageSize);
}
