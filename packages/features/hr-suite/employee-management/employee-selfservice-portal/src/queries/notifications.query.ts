import "server-only";

import { listComplianceAlertsRecords } from "../../../compliance-regulatory-tracking/src/server.ts";
import { listDocumentsManagementPolicyAcknowledgmentSummaries } from "../../../documents-management/src/server.ts";
import { listEnqueuedEmployeeLifecycleNotificationIntents } from "../../../employee-lifecycle-management/src/server.ts";
import { canReadEmployeeSelfservicePortal } from "../policy.ts";
import {
  projectEmployeeSelfservicePortalAcknowledgmentNotification,
  projectEmployeeSelfservicePortalComplianceNotification,
  projectEmployeeSelfservicePortalLifecycleNotification,
  projectEmployeeSelfservicePortalRequestNotification,
} from "../projector/notification.ts";
import { listEmployeeSelfservicePortalProfileUpdateRequestViews } from "../queries/profile-update-requests.query.ts";
import { listEmployeeSelfservicePortalRepositoryRecords } from "../repository.ts";
import type {
  EmployeeSelfservicePortalNotificationItem,
  ListEmployeeSelfservicePortalNotificationsQuery,
} from "../schema.ts";
import { listEmployeeSelfservicePortalNotificationsQuerySchema } from "../schema.ts";
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
  item: EmployeeSelfservicePortalNotificationItem,
  searchTerm: string
): boolean => {
  if (searchTerm.length === 0) {
    return true;
  }

  return [
    item.message,
    item.severity,
    item.source,
    item.status,
    item.title,
  ].some((value) => value.toLowerCase().includes(searchTerm));
};

export async function listEmployeeSelfservicePortalNotifications(
  query: ListEmployeeSelfservicePortalNotificationsQuery = {},
  context?: HrSuiteFeatureContext
): Promise<readonly EmployeeSelfservicePortalNotificationItem[]> {
  const parsedQuery =
    listEmployeeSelfservicePortalNotificationsQuerySchema.parse(query);

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

  const [lifecycleNotifications, complianceAlerts, acknowledgments] =
    await Promise.all([
      Promise.resolve(
        listEnqueuedEmployeeLifecycleNotificationIntents({
          companyId: context.companyId,
          tenantId: context.tenantId,
        }).filter(
          (entry) =>
            entry.employeeId === employeeId && entry.audienceRole === "employee"
        )
      ),
      listComplianceAlertsRecords(
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
    ]);

  const requestNotifications =
    listEmployeeSelfservicePortalProfileUpdateRequestViews(
      {
        employeeId,
      },
      context
    ).filter((entry) => entry.status !== "cancelled");

  const notifications = [
    ...lifecycleNotifications.map(
      projectEmployeeSelfservicePortalLifecycleNotification
    ),
    ...complianceAlerts
      .filter((entry) => entry.status !== "closed")
      .map(projectEmployeeSelfservicePortalComplianceNotification),
    ...acknowledgments.map(
      projectEmployeeSelfservicePortalAcknowledgmentNotification
    ),
    ...requestNotifications.map(
      projectEmployeeSelfservicePortalRequestNotification
    ),
  ]
    .filter((entry) =>
      parsedQuery.severity ? entry.severity === parsedQuery.severity : true
    )
    .filter((entry) =>
      parsedQuery.status ? entry.status === parsedQuery.status : true
    )
    .filter((entry) => matchesSearch(entry, searchTerm))
    .sort(
      (left, right) =>
        right.createdAt.getTime() - left.createdAt.getTime() ||
        (left.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER) -
          (right.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER)
    );

  const startIndex = (page - 1) * pageSize;
  return notifications.slice(startIndex, startIndex + pageSize);
}
