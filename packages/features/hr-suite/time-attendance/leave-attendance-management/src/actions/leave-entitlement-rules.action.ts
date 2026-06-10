import "server-only";

import type {
  LamMutationResult,
  UpsertLamLeaveEntitlementRuleInput,
} from "../contracts/index.ts";
import {
  leaveAttendanceManagementAuditEvents,
  upsertLamLeaveEntitlementRuleInputSchema,
} from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireLamLeaveEntitlementsWriteAccess,
} from "../execution.ts";
import {
  createLamRecordId,
  mutateLamRepository,
  upsertLamEntity,
} from "../repository.ts";
import {
  lamEntitlementRuleScopeSchema,
  lamLeaveEntitlementRuleSchema,
  lamWriteContextSchema,
} from "../schema.ts";

const toFailure = (error: unknown): LamMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected leave and attendance mutation failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error(
      "Company context is required for leave entitlement rule mutations"
    );
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error(
      "Input companyId does not match leave and attendance context"
    );
  }

  return args.contextCompanyId;
};

const findDuplicateEntitlementRuleCode = (
  rules: readonly {
    code: string;
    companyId?: string | null;
    id: string;
  }[],
  args: { code: string; companyId: string; id: string }
): boolean =>
  rules.some(
    (entry) =>
      entry.id !== args.id &&
      entry.companyId === args.companyId &&
      entry.code.toLowerCase() === args.code.toLowerCase()
  );

const normalizeEntitlementScope = (
  scope: UpsertLamLeaveEntitlementRuleInput["scope"]
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

const assertTenureRange = (
  tenureMonthsMin?: number | null,
  tenureMonthsMax?: number | null
): void => {
  if (
    tenureMonthsMin != null &&
    tenureMonthsMax != null &&
    tenureMonthsMin > tenureMonthsMax
  ) {
    throw new Error("tenureMonthsMin cannot exceed tenureMonthsMax");
  }
};

const assertEffectiveDateRange = (
  effectiveFrom: Date,
  effectiveTo?: Date | null
): void => {
  if (effectiveTo && effectiveTo.getTime() <= effectiveFrom.getTime()) {
    throw new Error("effectiveTo must be after effectiveFrom");
  }
};

export async function upsertLamLeaveEntitlementRule(
  input: UpsertLamLeaveEntitlementRuleInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireLamLeaveEntitlementsWriteAccess(context);
  if (denied) {
    return denied;
  }

  try {
    const validInput = upsertLamLeaveEntitlementRuleInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    assertTenureRange(validInput.tenureMonthsMin, validInput.tenureMonthsMax);
    assertEffectiveDateRange(validInput.effectiveFrom, validInput.effectiveTo);

    const isUpdate = Boolean(validInput.id);
    const normalizedScope = normalizeEntitlementScope(validInput.scope);
    const parsed = lamLeaveEntitlementRuleSchema.parse({
      id: validInput.id ?? createLamRecordId(),
      companyId,
      leaveTypeId: validInput.leaveTypeId,
      code: validInput.code.trim(),
      title: validInput.title.trim(),
      scope: normalizedScope,
      entitlementDays: validInput.entitlementDays,
      accrualRule: validInput.accrualRule ?? null,
      tenureMonthsMin: validInput.tenureMonthsMin ?? null,
      tenureMonthsMax: validInput.tenureMonthsMax ?? null,
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
        findDuplicateEntitlementRuleCode(draft.leaveEntitlementRules, {
          code: parsed.code,
          companyId,
          id: parsed.id,
        })
      ) {
        throw new Error(
          `Leave entitlement rule code "${parsed.code}" already exists`
        );
      }

      const before = draft.leaveEntitlementRules.find(
        (entry) => entry.id === parsed.id
      );
      const next = lamLeaveEntitlementRuleSchema.parse({
        ...parsed,
        createdAt: before?.createdAt ?? parsed.createdAt,
      });
      draft.leaveEntitlementRules = upsertLamEntity(
        draft.leaveEntitlementRules,
        next
      );
      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId: next.companyId ?? undefined,
          actorId: normalizeLamMutationActorId(context),
          action: isUpdate
            ? leaveAttendanceManagementAuditEvents.leaveEntitlementRuleUpdated
            : leaveAttendanceManagementAuditEvents.leaveEntitlementRuleCreated,
          entityType: "leave_entitlement_rule",
          entityId: next.id,
          summary: next.title,
          metadata: buildLamAuditMetadata({
            code: next.code,
            leaveTypeId: next.leaveTypeId,
            entitlementDays: next.entitlementDays,
            legalEntityCode: next.scope?.legalEntityCode,
            countryCode: next.scope?.countryCode,
            workLocationCode: next.scope?.workLocationCode,
            employmentType: next.scope?.employmentType,
            grade: next.scope?.grade,
            policyGroupId: next.scope?.policyGroupId,
            departmentId: next.scope?.departmentId,
            tenureMonthsMin: next.tenureMonthsMin,
            tenureMonthsMax: next.tenureMonthsMax,
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
