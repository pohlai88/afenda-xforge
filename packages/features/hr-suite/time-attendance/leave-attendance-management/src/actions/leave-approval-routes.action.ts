import "server-only";

import type {
  LamMutationResult,
  RouteLamLeaveApplicationInput,
  UpsertLamLeaveApprovalRouteInput,
} from "../contracts/index.ts";
import {
  leaveAttendanceManagementAuditEvents,
  routeLamLeaveApplicationInputSchema,
  upsertLamLeaveApprovalRouteInputSchema,
} from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireLamMutationAccess,
} from "../execution.ts";
import {
  resolveCurrentApprovalStep,
  selectLeaveApprovalRoute,
} from "../projector/approval-routing.ts";
import {
  createLamRecordId,
  mutateLamRepository,
  upsertLamEntity,
} from "../repository.ts";
import {
  lamEntitlementRuleScopeSchema,
  lamLeaveApplicationSchema,
  lamLeaveApprovalRouteSchema,
  lamWriteContextSchema,
} from "../schema.ts";
import { assertRouteStepHrFallbackConfiguration } from "../shared/leave-approval-fallback-to-hr.ts";

const toFailure = (error: unknown): LamMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected leave approval route mutation failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error(
      "Company context is required for leave approval route mutations"
    );
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error(
      "Input companyId does not match leave and attendance context"
    );
  }

  return args.contextCompanyId;
};

const normalizeRouteScope = (
  scope: UpsertLamLeaveApprovalRouteInput["scope"]
) =>
  lamEntitlementRuleScopeSchema.partial().parse({
    countryCode: scope?.countryCode ?? undefined,
    legalEntityCode: scope?.legalEntityCode ?? undefined,
    workLocationCode: scope?.workLocationCode ?? undefined,
    employmentType: scope?.employmentType ?? undefined,
    grade: scope?.grade ?? undefined,
    policyGroupId: scope?.policyGroupId ?? undefined,
    departmentId: scope?.departmentId ?? undefined,
  });

const assertValidRouteSteps = (
  steps: UpsertLamLeaveApprovalRouteInput["steps"]
): void => {
  const orders = steps.map((step) => step.order);
  const uniqueOrders = new Set(orders);
  if (uniqueOrders.size !== orders.length) {
    throw new Error("Approval route steps must have unique order values");
  }

  for (const step of steps) {
    if (step.kind === "named_approver" && !step.approverRef?.trim()) {
      throw new Error(
        `Step ${step.order} with kind "named_approver" requires approverRef`
      );
    }

    assertRouteStepHrFallbackConfiguration(step);
  }
};

const findDuplicateRouteCode = (
  routes: readonly { code: string; companyId?: string | null; id: string }[],
  args: { code: string; companyId: string; id: string }
): boolean =>
  routes.some(
    (entry) =>
      entry.id !== args.id &&
      entry.companyId === args.companyId &&
      entry.code.toLowerCase() === args.code.toLowerCase()
  );

export async function upsertLamLeaveApprovalRoute(
  input: UpsertLamLeaveApprovalRouteInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireLamMutationAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = upsertLamLeaveApprovalRouteInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    assertValidRouteSteps(validInput.steps);

    if (
      validInput.minDurationDays != null &&
      validInput.maxDurationDays != null &&
      validInput.maxDurationDays < validInput.minDurationDays
    ) {
      throw new Error(
        "maxDurationDays must be greater than or equal to minDurationDays"
      );
    }

    const isUpdate = Boolean(validInput.id);
    const parsed = lamLeaveApprovalRouteSchema.parse({
      id: validInput.id ?? createLamRecordId(),
      companyId,
      code: validInput.code.trim(),
      title: validInput.title.trim(),
      leaveTypeId: validInput.leaveTypeId ?? null,
      scope: normalizeRouteScope(validInput.scope),
      minDurationDays: validInput.minDurationDays ?? null,
      maxDurationDays: validInput.maxDurationDays ?? null,
      steps: validInput.steps.map((step) => ({
        order: step.order,
        kind: step.kind,
        approverRef: step.approverRef ?? null,
        label: step.label ?? null,
        fallbackToHr: step.fallbackToHr ?? false,
      })),
      active: validInput.active ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await mutateLamRepository((draft) => {
      if (
        parsed.leaveTypeId &&
        !draft.leaveTypes.some(
          (entry) =>
            entry.id === parsed.leaveTypeId && entry.companyId === companyId
        )
      ) {
        throw new Error(
          `Leave type "${parsed.leaveTypeId}" was not found for this company`
        );
      }

      if (
        findDuplicateRouteCode(draft.leaveApprovalRoutes, {
          code: parsed.code,
          companyId,
          id: parsed.id,
        })
      ) {
        throw new Error(`Approval route code "${parsed.code}" already exists`);
      }

      const before = draft.leaveApprovalRoutes.find(
        (entry) => entry.id === parsed.id
      );
      const next = lamLeaveApprovalRouteSchema.parse({
        ...parsed,
        createdAt: before?.createdAt ?? parsed.createdAt,
      });
      draft.leaveApprovalRoutes = upsertLamEntity(
        draft.leaveApprovalRoutes,
        next
      );
      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: normalizeLamMutationActorId(context),
          action: isUpdate
            ? leaveAttendanceManagementAuditEvents.leaveApprovalRouteUpdated
            : leaveAttendanceManagementAuditEvents.leaveApprovalRouteCreated,
          entityType: "approval_route",
          entityId: next.id,
          summary: next.title,
          metadata: buildLamAuditMetadata({
            code: next.code,
            leaveTypeId: next.leaveTypeId,
            minDurationDays: next.minDurationDays,
            maxDurationDays: next.maxDurationDays,
            stepCount: next.steps.length,
            active: next.active,
            scope: next.scope,
          }),
          before,
          after: next,
        })
      );
    }, parsedContext);

    return { ok: true, targetId: parsed.id };
  } catch (error) {
    return toFailure(error);
  }
}

export async function routeLamLeaveApplication(
  input: RouteLamLeaveApplicationInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireLamMutationAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = routeLamLeaveApplicationInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });

    let targetId = "";

    await mutateLamRepository((draft) => {
      const existing = draft.leaveApplications.find(
        (entry) =>
          entry.id === validInput.applicationId && entry.companyId === companyId
      );
      if (!existing) {
        throw new Error(
          `Leave application "${validInput.applicationId}" was not found`
        );
      }

      if (existing.status !== "submitted") {
        throw new Error(
          `Leave application must be in submitted status to route; current status is "${existing.status}"`
        );
      }

      const route = selectLeaveApprovalRoute(draft.leaveApprovalRoutes, {
        companyId,
        leaveTypeId: existing.leaveTypeId,
        totalDays: existing.totalDays,
        scope: {
          countryCode: validInput.countryCode,
          legalEntityCode: validInput.legalEntityCode,
          workLocationCode: validInput.workLocationCode,
          employmentType: validInput.employmentType,
          grade: validInput.grade,
          policyGroupId: validInput.policyGroupId,
          departmentId: validInput.departmentId,
        },
      });

      if (!route) {
        throw new Error(
          "No matching approval route found for this leave application"
        );
      }

      const firstStep = resolveCurrentApprovalStep(route, 1);
      if (!firstStep) {
        throw new Error(
          `Approval route "${route.code}" does not define step order 1`
        );
      }

      const routed = lamLeaveApplicationSchema.parse({
        ...existing,
        status: "pending_approval",
        approvalRouteId: route.id,
        currentStepOrder: 1,
        updatedAt: new Date(),
      });

      draft.leaveApplications = upsertLamEntity(
        draft.leaveApplications,
        routed
      );
      targetId = routed.id;

      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: normalizeLamMutationActorId(context),
          action: leaveAttendanceManagementAuditEvents.leaveApplicationRouted,
          entityType: "leave_application",
          entityId: routed.id,
          summary: `Leave application routed to approval workflow "${route.code}"`,
          metadata: buildLamAuditMetadata({
            employeeId: existing.employeeId,
            leaveTypeId: existing.leaveTypeId,
            approvalRouteId: route.id,
            approvalRouteCode: route.code,
            currentStepOrder: 1,
            stepKind: firstStep.kind,
            stepLabel: firstStep.label,
            grade: validInput.grade,
            departmentId: validInput.departmentId,
          }),
          before: existing,
          after: routed,
        })
      );
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}
