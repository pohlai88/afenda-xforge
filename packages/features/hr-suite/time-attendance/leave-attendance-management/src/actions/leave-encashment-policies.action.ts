import "server-only";

import type {
  LamMutationResult,
  UpsertLamLeaveEncashmentPolicyInput,
} from "../contracts/index.ts";
import {
  leaveAttendanceManagementAuditEvents,
  upsertLamLeaveEncashmentPolicyInputSchema,
} from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireLamEncashmentWriteAccess,
} from "../execution.ts";
import {
  createLamRecordId,
  mutateLamRepository,
  upsertLamEntity,
} from "../repository.ts";
import {
  lamEntitlementRuleScopeSchema,
  lamLeaveEncashmentPolicySchema,
  lamWriteContextSchema,
} from "../schema.ts";

const toFailure = (error: unknown): LamMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected leave encashment policy mutation failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error(
      "Company context is required for leave encashment policy mutations"
    );
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error(
      "Input companyId does not match leave and attendance context"
    );
  }

  return args.contextCompanyId;
};

const assertEffectiveDateRange = (
  effectiveFrom: Date,
  effectiveTo?: Date | null
): void => {
  if (effectiveTo && effectiveTo.getTime() <= effectiveFrom.getTime()) {
    throw new Error("effectiveTo must be after effectiveFrom");
  }
};

const normalizeEncashmentPolicyScope = (
  scope: UpsertLamLeaveEncashmentPolicyInput["scope"]
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

const findDuplicateEncashmentPolicyCode = (
  policies: readonly { code: string; companyId?: string | null; id: string }[],
  args: { code: string; companyId: string; id: string }
): boolean =>
  policies.some(
    (entry) =>
      entry.id !== args.id &&
      entry.companyId === args.companyId &&
      entry.code.toLowerCase() === args.code.toLowerCase()
  );

export async function upsertLamLeaveEncashmentPolicy(
  input: UpsertLamLeaveEncashmentPolicyInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireLamEncashmentWriteAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = upsertLamLeaveEncashmentPolicyInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    assertEffectiveDateRange(validInput.effectiveFrom, validInput.effectiveTo);

    const isUpdate = Boolean(validInput.id);
    const normalizedScope = normalizeEncashmentPolicyScope(validInput.scope);
    const parsed = lamLeaveEncashmentPolicySchema.parse({
      id: validInput.id ?? createLamRecordId(),
      companyId,
      leaveTypeId: validInput.leaveTypeId,
      code: validInput.code.trim(),
      title: validInput.title.trim(),
      scope: normalizedScope,
      maxEncashableDays: validInput.maxEncashableDays,
      encashmentRatePercent: validInput.encashmentRatePercent,
      minRemainingBalanceDays: validInput.minRemainingBalanceDays ?? null,
      effectiveFrom: validInput.effectiveFrom,
      effectiveTo: validInput.effectiveTo ?? null,
      active: validInput.active ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await mutateLamRepository((draft) => {
      const leaveType = draft.leaveTypes.find(
        (entry) =>
          entry.id === parsed.leaveTypeId && entry.companyId === companyId
      );
      if (!leaveType) {
        throw new Error(
          `Leave type "${parsed.leaveTypeId}" was not found for this company`
        );
      }

      if (
        findDuplicateEncashmentPolicyCode(draft.leaveEncashmentPolicies, {
          code: parsed.code,
          companyId,
          id: parsed.id,
        })
      ) {
        throw new Error(
          `Leave encashment policy code "${parsed.code}" already exists`
        );
      }

      const before = draft.leaveEncashmentPolicies.find(
        (entry) => entry.id === parsed.id
      );
      const next = lamLeaveEncashmentPolicySchema.parse({
        ...parsed,
        createdAt: before?.createdAt ?? parsed.createdAt,
      });
      draft.leaveEncashmentPolicies = upsertLamEntity(
        draft.leaveEncashmentPolicies,
        next
      );
      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId: next.companyId ?? undefined,
          actorId: normalizeLamMutationActorId(context),
          action: isUpdate
            ? leaveAttendanceManagementAuditEvents.leaveEncashmentPolicyUpdated
            : leaveAttendanceManagementAuditEvents.leaveEncashmentPolicyCreated,
          entityType: "leave_encashment_policy",
          entityId: next.id,
          summary: next.title,
          metadata: buildLamAuditMetadata({
            code: next.code,
            leaveTypeId: next.leaveTypeId,
            maxEncashableDays: next.maxEncashableDays,
            encashmentRatePercent: next.encashmentRatePercent,
            minRemainingBalanceDays: next.minRemainingBalanceDays,
            legalEntityCode: next.scope?.legalEntityCode,
            countryCode: next.scope?.countryCode,
            workLocationCode: next.scope?.workLocationCode,
            employmentType: next.scope?.employmentType,
            grade: next.scope?.grade,
            policyGroupId: next.scope?.policyGroupId,
            departmentId: next.scope?.departmentId,
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
