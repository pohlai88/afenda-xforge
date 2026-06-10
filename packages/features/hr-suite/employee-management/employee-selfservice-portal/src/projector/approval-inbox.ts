import type { EmployeeSelfservicePortalProfileSource } from "../employee-records.integration.ts";
import type {
  EmployeeSelfservicePortalManagerApprovalInboxItem,
  EmployeeSelfservicePortalProfileUpdateRequest,
} from "../schema.ts";
import { employeeSelfservicePortalManagerApprovalInboxItemSchema } from "../schema.ts";
import type { HrSuiteFeatureContext } from "../shared/index.ts";

const buildSummary = (
  employeeDisplayName: string,
  changedFields: readonly string[]
): string => {
  if (changedFields.length === 0) {
    return `${employeeDisplayName} submitted a profile update request.`;
  }

  return `${employeeDisplayName} requested updates to ${changedFields.join(", ")}.`;
};

export const projectEmployeeSelfservicePortalManagerApprovalInboxItem = (
  request: EmployeeSelfservicePortalProfileUpdateRequest,
  employee: EmployeeSelfservicePortalProfileSource,
  context?: HrSuiteFeatureContext
): EmployeeSelfservicePortalManagerApprovalInboxItem => {
  const changedFields = Object.keys(request.requestedChanges).sort();
  const canApprove = request.status === "pending_hr_review";
  const canReject = request.status === "pending_hr_review";

  return employeeSelfservicePortalManagerApprovalInboxItemSchema.parse({
    approvalReference: request.approvalReference,
    canApprove:
      canApprove &&
      (!request.requiresSensitiveApproval || context?.canViewSensitive),
    canReject:
      canReject &&
      (!request.requiresSensitiveApproval || context?.canViewSensitive),
    changedFields,
    employeeDisplayName: employee.displayName,
    employeeId: request.employeeId,
    employeeNumber: employee.employeeNumber,
    id: request.id,
    reason: request.reason,
    requestType: request.requestType,
    requiresSensitiveApproval: request.requiresSensitiveApproval,
    reviewedAt: request.reviewedAt,
    reviewedByUserId: request.reviewedByUserId,
    status: request.status,
    submittedAt: request.submittedAt,
    summary: buildSummary(employee.displayName, changedFields),
    updatedAt: request.updatedAt,
  });
};
