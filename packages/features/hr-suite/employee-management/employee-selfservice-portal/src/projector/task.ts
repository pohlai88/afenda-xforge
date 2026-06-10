import type { ComplianceRequirementProjection } from "../../../compliance-regulatory-tracking/src/contracts/index.ts";
import type { DocumentsManagementPolicyAcknowledgmentSummaryProjection } from "../../../documents-management/src/contracts/index.ts";
import type { EmployeeLifecycleTaskEntry } from "../../../employee-lifecycle-management/src/projector.ts";
import type { OffboardingCaseProjection } from "../../../offboarding-exit-management/src/contracts/index.ts";

import type {
  EmployeeSelfservicePortalProfileUpdateRequestView,
  EmployeeSelfservicePortalTaskCategory,
  EmployeeSelfservicePortalTaskItem,
  EmployeeSelfservicePortalTaskStatus,
} from "../schema.ts";
import { employeeSelfservicePortalTaskItemSchema } from "../schema.ts";

const mapLifecycleCategory = (
  task: EmployeeLifecycleTaskEntry
): EmployeeSelfservicePortalTaskCategory => {
  if (task.source === "onboarding") {
    return "onboarding";
  }

  if (task.source === "exit" || task.lifecycleStage === "offboarding") {
    return "offboarding";
  }

  return "hr";
};

const mapComplianceStatus = (
  status: ComplianceRequirementProjection["status"]
): EmployeeSelfservicePortalTaskStatus => {
  switch (status) {
    case "expired":
    case "non_compliant":
    case "overdue":
      return "overdue";
    case "at_risk":
      return "due";
    case "pending":
      return "pending";
    case "waived":
      return "completed";
    case "compliant":
      return "completed";
    default:
      return "pending";
  }
};

const mapRequestTaskStatus = (
  status: EmployeeSelfservicePortalProfileUpdateRequestView["status"]
): EmployeeSelfservicePortalTaskStatus => {
  switch (status) {
    case "rejected":
      return "action_required";
    case "approved":
      return "completed";
    case "cancelled":
      return "completed";
    case "pending_hr_review":
      return "pending";
    default:
      return "pending";
  }
};

export function projectEmployeeSelfservicePortalLifecycleTask(
  task: EmployeeLifecycleTaskEntry
): EmployeeSelfservicePortalTaskItem {
  return employeeSelfservicePortalTaskItemSchema.parse({
    actionable: task.status !== "completed",
    category: mapLifecycleCategory(task),
    createdAt: task.createdAt,
    dueAt: task.dueAt ?? null,
    employeeId: task.employeeId,
    id: `lifecycle-task:${task.id}`,
    source: "employee_lifecycle_management",
    sourceRecordId: task.id,
    sourceRecordType: "lifecycle_task",
    status: task.status,
    summary: task.summary,
    title: task.title,
    updatedAt: task.updatedAt,
  });
}

export function projectEmployeeSelfservicePortalOffboardingTask(
  entry: OffboardingCaseProjection
): EmployeeSelfservicePortalTaskItem {
  return employeeSelfservicePortalTaskItemSchema.parse({
    actionable: entry.status === "open",
    category: "offboarding",
    createdAt: entry.createdAt,
    dueAt: entry.lastWorkingDate ?? entry.noticeEndDate ?? null,
    employeeId: entry.employeeId,
    id: `offboarding-case:${entry.id}`,
    source: "offboarding_exit_management",
    sourceRecordId: entry.id,
    sourceRecordType: "offboarding_case",
    status: entry.status === "completed" ? "completed" : "pending",
    summary:
      entry.reasonDetails?.trim() ||
      `${entry.exitType.replaceAll("_", " ")} offboarding remains active.`,
    title: `Offboarding case: ${entry.exitType.replaceAll("_", " ")}`,
    updatedAt: entry.updatedAt,
  });
}

export function projectEmployeeSelfservicePortalComplianceTask(
  entry: ComplianceRequirementProjection
): EmployeeSelfservicePortalTaskItem {
  return employeeSelfservicePortalTaskItemSchema.parse({
    actionable: entry.status !== "compliant" && entry.status !== "waived",
    category: "compliance",
    createdAt: entry.lastEvaluatedAt,
    dueAt: entry.dueAt ?? entry.expiresAt ?? null,
    employeeId: entry.employeeId,
    id: `compliance-requirement:${entry.id}`,
    source: "compliance_regulatory_tracking",
    sourceRecordId: entry.id,
    sourceRecordType: "compliance_requirement",
    status: mapComplianceStatus(entry.status),
    summary:
      entry.statusReason?.trim() ||
      `${entry.requirementKind.replaceAll("_", " ")} requirement is ${entry.status.replaceAll("_", " ")}.`,
    title: entry.obligationTitle,
    updatedAt: entry.lastEvaluatedAt,
  });
}

export function projectEmployeeSelfservicePortalAcknowledgmentTask(
  entry: DocumentsManagementPolicyAcknowledgmentSummaryProjection
): EmployeeSelfservicePortalTaskItem {
  return employeeSelfservicePortalTaskItemSchema.parse({
    actionable: entry.acknowledgmentStatus !== "acknowledged",
    category: "hr",
    createdAt: entry.updatedAt,
    dueAt: null,
    employeeId: entry.employeeId,
    id: `documents-acknowledgment:${entry.id}`,
    source: "documents_management",
    sourceRecordId: entry.obligationId,
    sourceRecordType: "document_acknowledgment",
    status: entry.acknowledgmentStatus === "acknowledged" ? "completed" : "due",
    summary: "Policy or required HR notice acknowledgment is pending.",
    title: entry.title,
    updatedAt: entry.updatedAt,
  });
}

export function projectEmployeeSelfservicePortalRequestTask(
  entry: EmployeeSelfservicePortalProfileUpdateRequestView
): EmployeeSelfservicePortalTaskItem {
  return employeeSelfservicePortalTaskItemSchema.parse({
    actionable: entry.status === "rejected",
    category: "hr",
    createdAt: new Date(entry.createdAt),
    dueAt: null,
    employeeId: entry.employeeId,
    id: `profile-update-request:${entry.id}`,
    source: "employee_selfservice_portal",
    sourceRecordId: entry.id,
    sourceRecordType: "profile_update_request",
    status: mapRequestTaskStatus(entry.status),
    summary:
      entry.status === "rejected"
        ? (entry.rejectionReason ?? "Profile update request needs correction.")
        : `Profile update request is ${entry.status.replaceAll("_", " ")}.`,
    title: "Profile update request",
    updatedAt: new Date(entry.updatedAt),
  });
}
