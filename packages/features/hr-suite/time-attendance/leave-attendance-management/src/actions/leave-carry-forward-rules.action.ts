import "server-only";

import type {
  LamMutationResult,
  UpsertLamLeaveCarryForwardRuleInput,
} from "../contracts/index.ts";
import {
  leaveAttendanceManagementAuditEvents,
  upsertLamLeaveCarryForwardRuleInputSchema,
} from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireLamMutationAccess,
} from "../execution.ts";
import {
  createLamRecordId,
  mutateLamRepository,
  upsertLamEntity,
} from "../repository.ts";
import {
  lamEntitlementRuleScopeSchema,
  lamLeaveCarryForwardRuleSchema,
  lamWriteContextSchema,
} from "../schema.ts";

const toFailure = (error: unknown): LamMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected leave carry-forward rule mutation failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error(
      "Company context is required for leave carry-forward rule mutations"
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

const normalizeCarryForwardScope = (
  scope: UpsertLamLeaveCarryForwardRuleInput["scope"]
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

const findDuplicateCarryForwardRuleCode = (
  rules: readonly { code: string; companyId?: string | null; id: string }[],
  args: { code: string; companyId: string; id: string }
): boolean =>
  rules.some(
    (entry) =>
      entry.id !== args.id &&
      entry.companyId === args.companyId &&
      entry.code.toLowerCase() === args.code.toLowerCase()
  );

export async function upsertLamLeaveCarryForwardRule(
  input: UpsertLamLeaveCarryForwardRuleInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireLamMutationAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = upsertLamLeaveCarryForwardRuleInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    assertEffectiveDateRange(validInput.effectiveFrom, validInput.effectiveTo);

    const isUpdate = Boolean(validInput.id);
    const normalizedScope = normalizeCarryForwardScope(validInput.scope);
    const parsed = lamLeaveCarryForwardRuleSchema.parse({
      id: validInput.id ?? createLamRecordId(),
      companyId,
      leaveTypeId: validInput.leaveTypeId,
      code: validInput.code.trim(),
      title: validInput.title.trim(),
      scope: normalizedScope,
      maxCarryForwardDays: validInput.maxCarryForwardDays,
      forfeitUnused: validInput.forfeitUnused ?? true,
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
        findDuplicateCarryForwardRuleCode(draft.leaveCarryForwardRules, {
          code: parsed.code,
          companyId,
          id: parsed.id,
        })
      ) {
        throw new Error(
          `Leave carry-forward rule code "${parsed.code}" already exists`
        );
      }

      const before = draft.leaveCarryForwardRules.find(
        (entry) => entry.id === parsed.id
      );
      const next = lamLeaveCarryForwardRuleSchema.parse({
        ...parsed,
        createdAt: before?.createdAt ?? parsed.createdAt,
      });
      draft.leaveCarryForwardRules = upsertLamEntity(
        draft.leaveCarryForwardRules,
        next
      );
      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId: next.companyId ?? undefined,
          actorId: normalizeLamMutationActorId(context),
          action: isUpdate
            ? leaveAttendanceManagementAuditEvents.leaveCarryForwardRuleUpdated
            : leaveAttendanceManagementAuditEvents.leaveCarryForwardRuleCreated,
          entityType: "leave_carry_forward_rule",
          entityId: next.id,
          summary: next.title,
          metadata: buildLamAuditMetadata({
            code: next.code,
            leaveTypeId: next.leaveTypeId,
            maxCarryForwardDays: next.maxCarryForwardDays,
            forfeitUnused: next.forfeitUnused,
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
