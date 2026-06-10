import type { ComplianceAlertProjection } from "../../../compliance-regulatory-tracking/src/contracts/index.ts";
import type { DocumentsManagementPolicyAcknowledgmentSummaryProjection } from "../../../documents-management/src/contracts/index.ts";
import type { EmployeeLifecycleNotificationIntent } from "../../../employee-lifecycle-management/src/contracts/automation.contract.ts";

import type {
  EmployeeSelfservicePortalNotificationItem,
  EmployeeSelfservicePortalNotificationSeverity,
  EmployeeSelfservicePortalNotificationStatus,
  EmployeeSelfservicePortalProfileUpdateRequestView,
} from "../schema.ts";
import { employeeSelfservicePortalNotificationItemSchema } from "../schema.ts";

const mapLifecycleSeverity = (
  kind: EmployeeLifecycleNotificationIntent["kind"]
): EmployeeSelfservicePortalNotificationSeverity => {
  switch (kind) {
    case "probation_review_overdue":
      return "high";
    case "suspension_open":
    case "offboarding_pending":
      return "warning";
    default:
      return "info";
  }
};

const mapComplianceSeverity = (
  severity: ComplianceAlertProjection["severity"]
): EmployeeSelfservicePortalNotificationSeverity => {
  switch (severity) {
    case "critical":
      return "critical";
    case "high":
      return "high";
    case "warning":
      return "warning";
    case "info":
      return "info";
    default:
      return "info";
  }
};

const mapComplianceStatus = (
  status: ComplianceAlertProjection["status"]
): EmployeeSelfservicePortalNotificationStatus => {
  switch (status) {
    case "acknowledged":
      return "acknowledged";
    case "closed":
      return "closed";
    case "open":
      return "open";
    default:
      return "open";
  }
};

export function projectEmployeeSelfservicePortalLifecycleNotification(
  entry: EmployeeLifecycleNotificationIntent
): EmployeeSelfservicePortalNotificationItem {
  return employeeSelfservicePortalNotificationItemSchema.parse({
    actionable: true,
    createdAt: entry.createdAt,
    dueAt: entry.dueAt ?? null,
    employeeId: entry.employeeId,
    id: `lifecycle-notification:${entry.id}`,
    message: entry.reason?.trim() || entry.summary,
    relatedRecordId: entry.sourceEventId ?? null,
    relatedRecordType: "lifecycle_notification",
    severity: mapLifecycleSeverity(entry.kind),
    source: "employee_lifecycle_management",
    status: "open",
    title: entry.summary,
  });
}

export function projectEmployeeSelfservicePortalComplianceNotification(
  entry: ComplianceAlertProjection
): EmployeeSelfservicePortalNotificationItem {
  return employeeSelfservicePortalNotificationItemSchema.parse({
    actionable: entry.status === "open",
    createdAt: entry.generatedAt,
    dueAt: entry.dueAt ?? null,
    employeeId: entry.employeeId,
    id: `compliance-alert:${entry.id}`,
    message: entry.message,
    relatedRecordId: entry.requirementId,
    relatedRecordType: "compliance_alert",
    severity: mapComplianceSeverity(entry.severity),
    source: "compliance_regulatory_tracking",
    status: mapComplianceStatus(entry.status),
    title: "Compliance alert",
  });
}

export function projectEmployeeSelfservicePortalRequestNotification(
  entry: EmployeeSelfservicePortalProfileUpdateRequestView
): EmployeeSelfservicePortalNotificationItem {
  return employeeSelfservicePortalNotificationItemSchema.parse({
    actionable: entry.status === "rejected",
    createdAt: new Date(entry.updatedAt),
    dueAt: null,
    employeeId: entry.employeeId,
    id: `profile-update-notification:${entry.id}`,
    message:
      entry.status === "rejected"
        ? (entry.rejectionReason ??
          "Profile update request requires correction.")
        : `Profile update request is ${entry.status.replaceAll("_", " ")}.`,
    relatedRecordId: entry.id,
    relatedRecordType: "profile_update_request",
    severity: entry.status === "rejected" ? "warning" : "info",
    source: "employee_selfservice_portal",
    status: "open",
    title: "Profile update request",
  });
}

export function projectEmployeeSelfservicePortalAcknowledgmentNotification(
  entry: DocumentsManagementPolicyAcknowledgmentSummaryProjection
): EmployeeSelfservicePortalNotificationItem {
  return employeeSelfservicePortalNotificationItemSchema.parse({
    actionable: entry.acknowledgmentStatus !== "acknowledged",
    createdAt: entry.updatedAt,
    dueAt: null,
    employeeId: entry.employeeId,
    id: `documents-acknowledgment-notification:${entry.id}`,
    message: "Required policy or HR notice acknowledgment remains pending.",
    relatedRecordId: entry.obligationId,
    relatedRecordType: "document_acknowledgment",
    severity: "warning",
    source: "documents_management",
    status: entry.acknowledgmentStatus === "acknowledged" ? "closed" : "open",
    title: entry.title,
  });
}
