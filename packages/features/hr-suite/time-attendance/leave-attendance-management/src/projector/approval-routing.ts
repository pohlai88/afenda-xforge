import type {
  LamEntitlementRuleScope,
  LamLeaveApprovalRoute,
} from "../schema.ts";
import { matchesEntitlementRuleScope } from "./entitlement.ts";

export type LamLeaveApprovalRoutingContext = {
  companyId: string;
  leaveTypeId: string;
  totalDays: number;
  scope?: Partial<LamEntitlementRuleScope>;
};

const countRouteSpecificity = (route: LamLeaveApprovalRoute): number => {
  let score = 0;

  if (route.leaveTypeId) {
    score += 4;
  }

  if (route.minDurationDays != null || route.maxDurationDays != null) {
    score += 2;
  }

  if (route.scope) {
    score += Object.values(route.scope).filter(
      (value) => value != null && String(value).trim().length > 0
    ).length;
  }

  return score;
};

export const routeMatchesApprovalContext = (
  route: LamLeaveApprovalRoute,
  ctx: LamLeaveApprovalRoutingContext
): boolean => {
  if (!route.active || route.companyId !== ctx.companyId) {
    return false;
  }

  if (route.leaveTypeId && route.leaveTypeId !== ctx.leaveTypeId) {
    return false;
  }

  if (route.minDurationDays != null && ctx.totalDays < route.minDurationDays) {
    return false;
  }

  if (route.maxDurationDays != null && ctx.totalDays > route.maxDurationDays) {
    return false;
  }

  if (route.scope) {
    const scopedFields = Object.values(route.scope).filter(
      (value) => value != null && String(value).trim().length > 0
    );
    if (scopedFields.length > 0) {
      if (!ctx.scope) {
        return false;
      }

      if (
        !matchesEntitlementRuleScope(
          {
            companyId: ctx.companyId,
            employeeId: "routing",
            hireDate: new Date(0),
            countryCode: ctx.scope.countryCode,
            legalEntityCode: ctx.scope.legalEntityCode,
            workLocationCode: ctx.scope.workLocationCode,
            employmentType: ctx.scope.employmentType,
            grade: ctx.scope.grade,
            policyGroupId: ctx.scope.policyGroupId,
            departmentId: ctx.scope.departmentId,
          },
          route.scope
        )
      ) {
        return false;
      }
    }
  }

  return true;
};

export const selectLeaveApprovalRoute = (
  routes: readonly LamLeaveApprovalRoute[],
  ctx: LamLeaveApprovalRoutingContext
): LamLeaveApprovalRoute | null => {
  const candidates = routes.filter((route) =>
    routeMatchesApprovalContext(route, ctx)
  );

  if (candidates.length === 0) {
    return null;
  }

  return (
    [...candidates].sort((left, right) => {
      const specificityDelta =
        countRouteSpecificity(right) - countRouteSpecificity(left);
      if (specificityDelta !== 0) {
        return specificityDelta;
      }

      return right.updatedAt.getTime() - left.updatedAt.getTime();
    })[0] ?? null
  );
};

export const resolveCurrentApprovalStep = (
  route: LamLeaveApprovalRoute,
  stepOrder: number
) => {
  const sortedSteps = [...route.steps].sort(
    (left, right) => left.order - right.order
  );
  return sortedSteps.find((step) => step.order === stepOrder) ?? null;
};
