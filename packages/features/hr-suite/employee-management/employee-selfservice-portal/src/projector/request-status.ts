import type {
  EmployeeSelfservicePortalProfileUpdateRequestView,
  EmployeeSelfservicePortalRequestStatusItem,
} from "../schema.ts";
import { employeeSelfservicePortalRequestStatusItemSchema } from "../schema.ts";

export function projectEmployeeSelfservicePortalRequestStatus(
  entry: EmployeeSelfservicePortalProfileUpdateRequestView
): EmployeeSelfservicePortalRequestStatusItem {
  return employeeSelfservicePortalRequestStatusItemSchema.parse({
    approvalReference: entry.approvalReference,
    employeeId: entry.employeeId,
    id: entry.id,
    rejectionReason: entry.rejectionReason,
    requestType: "profile_update",
    requiresAction: entry.status === "rejected",
    requiresSensitiveApproval: entry.requiresSensitiveApproval,
    reviewedAt: entry.reviewedAt ? new Date(entry.reviewedAt) : null,
    status: entry.status,
    submittedAt: new Date(entry.submittedAt),
    summary:
      entry.status === "rejected"
        ? (entry.rejectionReason ?? "Profile update request was rejected.")
        : `Profile update request is ${entry.status.replaceAll("_", " ")}.`,
    updatedAt: new Date(entry.updatedAt),
  });
}
