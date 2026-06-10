import "server-only";

import type {
  LamLeaveApprovalRoute,
  LamLeaveApprovalRouteStep,
} from "@repo/features-time-attendance-leave-attendance-management/contract";
import { getLamLeaveApprovalRouteById } from "@repo/features-time-attendance-leave-attendance-management/server";
import {
  getHrEmployeeRecord,
  listHrEmployeeRecords,
} from "@repo/features-employee-management-employee-records-management/server";
import {
  getHrOrgUnitById,
  listHrOrgReportingLinesWindow,
} from "@repo/features-employee-management-organizational-chart-hierarchy/server";
import type { LamOperationalWriteContext } from "./lam-governed-context.ts";
import { isLamOrchestrationHeaderMode } from "./lam-governed-context.ts";

type LamOrchestrationScope = {
  companyId: string;
  tenantId: string;
};

export type LamApprovalOrchestrationSubject = {
  approvalRouteId?: string | null;
  currentStepOrder?: number | null;
  employeeId: string;
  status: string;
};

const header = (request: Request, name: string): string | undefined =>
  request.headers.get(name)?.trim() || undefined;

const parseCommaSeparatedIds = (value: string | undefined): string[] =>
  value
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean) ?? [];

const hasHeaderResolvedApprovers = (request: Request): boolean =>
  parseCommaSeparatedIds(
    header(request, "x-lam-resolved-step-approver-employee-ids")
  ).length > 0;

const createIntegrationReadContext = (scope: LamOrchestrationScope) => ({
  canRead: true,
  canWrite: false,
  companyId: scope.companyId,
  grantedCapabilities: [
    "hr.organization_structure.read",
    "hr.employee_records.read",
  ],
  organizationId: scope.companyId,
  tenantId: scope.tenantId,
});

const resolveCurrentApprovalStep = (
  route: LamLeaveApprovalRoute,
  stepOrder: number
): LamLeaveApprovalRouteStep | null =>
  route.steps.find((step) => step.order === stepOrder) ?? null;

const loadEmployeeRecord = (
  employeeId: string,
  scope: LamOrchestrationScope
) => {
  const context = createIntegrationReadContext(scope);
  const direct = getHrEmployeeRecord(employeeId, context);
  if (direct) {
    return direct;
  }

  for (const summary of listHrEmployeeRecords({}, context)) {
    if (summary.id === employeeId || summary.employeeNumber === employeeId) {
      return getHrEmployeeRecord(summary.id, context);
    }
  }

  return null;
};

const resolveDirectManagerEmployeeId = (
  subjectEmployeeId: string,
  scope: LamOrchestrationScope
): string | undefined => {
  const context = createIntegrationReadContext(scope);
  const reportingLines = listHrOrgReportingLinesWindow(
    {
      employeeId: subjectEmployeeId,
      relationshipType: "direct",
    },
    context
  ).rows;

  const activeLine = reportingLines.find(
    (line) => line.managerEmployeeId?.trim()
  );
  if (activeLine?.managerEmployeeId) {
    return activeLine.managerEmployeeId.trim();
  }

  const employeeRecord = loadEmployeeRecord(subjectEmployeeId, scope);
  return employeeRecord?.managerEmployeeId?.trim() || undefined;
};

const resolveDepartmentHeadEmployeeId = (
  subjectEmployeeId: string,
  scope: LamOrchestrationScope
): string | undefined => {
  const employeeRecord = loadEmployeeRecord(subjectEmployeeId, scope);
  const departmentId = employeeRecord?.currentDepartmentId?.trim();

  if (!departmentId) {
    return undefined;
  }

  const context = createIntegrationReadContext(scope);
  const unit = getHrOrgUnitById(departmentId, context);
  return unit?.managerEmployeeId?.trim() || undefined;
};

const resolveHrOwnerEmployeeId = (
  subjectEmployeeId: string,
  scope: LamOrchestrationScope
): string | undefined => {
  const employeeRecord = loadEmployeeRecord(subjectEmployeeId, scope);
  return employeeRecord?.hrOwnerEmployeeId?.trim() || undefined;
};

export const resolveLeaveApprovalStepApproverEmployeeIds = (args: {
  scope: LamOrchestrationScope;
  step: LamLeaveApprovalRouteStep;
  subjectEmployeeId: string;
}): string[] => {
  const ids = new Set<string>();

  if (args.step.kind === "named_approver" && args.step.approverRef?.trim()) {
    ids.add(args.step.approverRef.trim());
    return [...ids];
  }

  if (args.step.kind === "direct_manager") {
    const managerEmployeeId = resolveDirectManagerEmployeeId(
      args.subjectEmployeeId,
      args.scope
    );
    if (managerEmployeeId) {
      ids.add(managerEmployeeId);
    }
    return [...ids];
  }

  if (args.step.kind === "department_head") {
    const departmentHeadEmployeeId = resolveDepartmentHeadEmployeeId(
      args.subjectEmployeeId,
      args.scope
    );
    if (departmentHeadEmployeeId) {
      ids.add(departmentHeadEmployeeId);
    }
    return [...ids];
  }

  if (args.step.kind === "hr_officer") {
    const hrOwnerEmployeeId = resolveHrOwnerEmployeeId(
      args.subjectEmployeeId,
      args.scope
    );
    if (hrOwnerEmployeeId) {
      ids.add(hrOwnerEmployeeId);
    }
  }

  return [...ids];
};

export const resolveLeaveApprovalHrFallbackApproverEmployeeIds = (args: {
  scope: LamOrchestrationScope;
  subjectEmployeeId: string;
}): string[] => {
  const hrOwnerEmployeeId = resolveHrOwnerEmployeeId(
    args.subjectEmployeeId,
    args.scope
  );

  return hrOwnerEmployeeId ? [hrOwnerEmployeeId] : [];
};

export const resolveLeaveApprovalOrchestration = async (args: {
  readContext: {
    canRead?: boolean;
    companyId?: string | null;
    tenantId?: string | null;
  };
  subject: LamApprovalOrchestrationSubject;
}): Promise<{
  resolvedHrFallbackApproverEmployeeIds?: string[];
  resolvedStepApproverEmployeeIds?: string[];
}> => {
  if (
    args.subject.status !== "pending_approval" ||
    !args.subject.approvalRouteId?.trim()
  ) {
    return {};
  }

  const tenantId = args.readContext.tenantId?.trim() ?? undefined;
  const companyId = args.readContext.companyId?.trim() ?? undefined;
  if (!tenantId || !companyId) {
    return {};
  }

  const scope = { companyId, tenantId };
  const route = await getLamLeaveApprovalRouteById(args.subject.approvalRouteId, {
    canRead: args.readContext.canRead,
    companyId,
    tenantId,
  });

  if (!route) {
    return {};
  }

  const currentStepOrder = args.subject.currentStepOrder ?? 1;
  const currentStep = resolveCurrentApprovalStep(route, currentStepOrder);
  if (!currentStep) {
    return {};
  }

  const resolvedStepApproverEmployeeIds =
    resolveLeaveApprovalStepApproverEmployeeIds({
      scope,
      step: currentStep,
      subjectEmployeeId: args.subject.employeeId,
    });
  const resolvedHrFallbackApproverEmployeeIds =
    resolveLeaveApprovalHrFallbackApproverEmployeeIds({
      scope,
      subjectEmployeeId: args.subject.employeeId,
    });

  return {
    ...(resolvedStepApproverEmployeeIds.length > 0
      ? { resolvedStepApproverEmployeeIds }
      : {}),
    ...(resolvedHrFallbackApproverEmployeeIds.length > 0
      ? { resolvedHrFallbackApproverEmployeeIds }
      : {}),
  };
};

export const enrichLamApprovalWriteContext = async (
  request: Request,
  baseContext: LamOperationalWriteContext,
  subject?: LamApprovalOrchestrationSubject | null
): Promise<LamOperationalWriteContext> => {
  if (
    isLamOrchestrationHeaderMode() &&
    hasHeaderResolvedApprovers(request)
  ) {
    return baseContext;
  }

  if (
    baseContext.resolvedStepApproverEmployeeIds?.length &&
    !subject
  ) {
    return baseContext;
  }

  if (!subject) {
    return baseContext;
  }

  const orchestration = await resolveLeaveApprovalOrchestration({
    readContext: {
      canRead: true,
      companyId: baseContext.companyId?.trim() ?? undefined,
      tenantId: baseContext.tenantId?.trim() ?? undefined,
    },
    subject,
  });

  return {
    ...baseContext,
    resolvedHrFallbackApproverEmployeeIds:
      baseContext.resolvedHrFallbackApproverEmployeeIds ??
      orchestration.resolvedHrFallbackApproverEmployeeIds,
    resolvedStepApproverEmployeeIds:
      baseContext.resolvedStepApproverEmployeeIds ??
      orchestration.resolvedStepApproverEmployeeIds,
  };
};
