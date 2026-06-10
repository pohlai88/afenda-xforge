import type { EmployeeSelfservicePortalLeaveApplicationSourceRecord } from "../leave-attendance.integration.ts";
import type { EmployeeSelfservicePortalLeaveApplicationItem } from "../schema.ts";
import { employeeSelfservicePortalLeaveApplicationItemSchema } from "../schema.ts";

export function projectEmployeeSelfservicePortalLeaveApplication(
  record: EmployeeSelfservicePortalLeaveApplicationSourceRecord
): EmployeeSelfservicePortalLeaveApplicationItem {
  return employeeSelfservicePortalLeaveApplicationItemSchema.parse({
    approvalReference: record.approvalReference,
    employeeId: record.employeeId,
    endDate: record.endDate,
    id: record.id,
    leaveTypeCode: record.leaveTypeCode,
    leaveTypeName: record.leaveTypeName,
    reason: record.reason,
    rejectionReason: record.rejectionReason,
    reviewedAt: record.reviewedAt,
    reviewedByUserId: record.reviewedByUserId,
    startDate: record.startDate,
    status: record.status,
    submittedAt: record.submittedAt,
    totalUnits: record.totalUnits,
    unit: record.unit,
    updatedAt: record.updatedAt,
  });
}
