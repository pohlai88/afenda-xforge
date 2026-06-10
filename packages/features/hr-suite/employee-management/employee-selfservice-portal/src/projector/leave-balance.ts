import type { EmployeeSelfservicePortalLeaveBalanceSourceRecord } from "../leave-attendance.integration.ts";
import type { EmployeeSelfservicePortalLeaveBalanceItem } from "../schema.ts";
import { employeeSelfservicePortalLeaveBalanceItemSchema } from "../schema.ts";

export function projectEmployeeSelfservicePortalLeaveBalance(
  record: EmployeeSelfservicePortalLeaveBalanceSourceRecord
): EmployeeSelfservicePortalLeaveBalanceItem {
  return employeeSelfservicePortalLeaveBalanceItemSchema.parse({
    adjustedBalance: record.adjustedBalance,
    carriedForwardBalance: record.carriedForwardBalance,
    employeeId: record.employeeId,
    earnedBalance: record.earnedBalance,
    forfeitedBalance: record.forfeitedBalance,
    id: record.id,
    leaveTypeCode: record.leaveTypeCode,
    leaveTypeName: record.leaveTypeName,
    openingBalance: record.openingBalance,
    pendingBalance: record.pendingBalance,
    remainingBalance: record.remainingBalance,
    unit: record.unit,
    updatedAt: record.updatedAt,
    usedBalance: record.usedBalance,
  });
}
