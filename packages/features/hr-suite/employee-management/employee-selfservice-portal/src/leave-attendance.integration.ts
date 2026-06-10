import type {
  ListEmployeeSelfservicePortalLeaveApplicationsQuery,
  ListEmployeeSelfservicePortalLeaveBalancesQuery,
} from "./schema.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export type EmployeeSelfservicePortalLeaveBalanceSourceRecord = {
  adjustedBalance: number;
  carriedForwardBalance: number;
  employeeId: string;
  earnedBalance: number;
  forfeitedBalance: number;
  id: string;
  leaveTypeCode: string;
  leaveTypeName: string;
  openingBalance: number;
  pendingBalance: number;
  remainingBalance: number;
  unit: string;
  updatedAt: Date;
  usedBalance: number;
};

export type EmployeeSelfservicePortalLeaveApplicationSourceRecord = {
  approvalReference: string | null;
  employeeId: string;
  endDate: Date;
  id: string;
  leaveTypeCode: string;
  leaveTypeName: string;
  reason: string;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  reviewedByUserId: string | null;
  startDate: Date;
  status: string;
  submittedAt: Date;
  totalUnits: number;
  unit: string;
  updatedAt: Date;
};

export type EmployeeSelfservicePortalIntegratedLeaveBalancesQuery =
  ListEmployeeSelfservicePortalLeaveBalancesQuery & {
    employeeId: string;
  };

export type EmployeeSelfservicePortalIntegratedLeaveApplicationsQuery =
  ListEmployeeSelfservicePortalLeaveApplicationsQuery & {
    employeeId: string;
  };

type EmployeeSelfservicePortalLeaveAttendanceIntegration = {
  listLeaveApplications: (
    query: EmployeeSelfservicePortalIntegratedLeaveApplicationsQuery,
    context?: HrSuiteFeatureContext
  ) => readonly EmployeeSelfservicePortalLeaveApplicationSourceRecord[];
  listLeaveBalances: (
    query: EmployeeSelfservicePortalIntegratedLeaveBalancesQuery,
    context?: HrSuiteFeatureContext
  ) => readonly EmployeeSelfservicePortalLeaveBalanceSourceRecord[];
};

const defaultIntegration: EmployeeSelfservicePortalLeaveAttendanceIntegration = {
  listLeaveApplications: () => [],
  listLeaveBalances: () => [],
};

let integration: EmployeeSelfservicePortalLeaveAttendanceIntegration =
  defaultIntegration;

export const configureEmployeeSelfservicePortalLeaveAttendanceIntegration = (
  nextIntegration: EmployeeSelfservicePortalLeaveAttendanceIntegration
): void => {
  integration = nextIntegration;
};

export const resetEmployeeSelfservicePortalLeaveAttendanceIntegrationForTesting =
  (): void => {
    integration = defaultIntegration;
  };

export const listEmployeeSelfservicePortalIntegratedLeaveApplications = (
  query: EmployeeSelfservicePortalIntegratedLeaveApplicationsQuery,
  context?: HrSuiteFeatureContext
): readonly EmployeeSelfservicePortalLeaveApplicationSourceRecord[] =>
  integration.listLeaveApplications(query, context);

export const listEmployeeSelfservicePortalIntegratedLeaveBalances = (
  query: EmployeeSelfservicePortalIntegratedLeaveBalancesQuery,
  context?: HrSuiteFeatureContext
): readonly EmployeeSelfservicePortalLeaveBalanceSourceRecord[] =>
  integration.listLeaveBalances(query, context);
