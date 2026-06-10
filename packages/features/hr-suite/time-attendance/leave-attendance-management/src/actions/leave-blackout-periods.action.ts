import "server-only";

import type {
  LamMutationResult,
  UpsertLamLeaveBlackoutPeriodInput,
} from "../contracts/index.ts";
import {
  leaveAttendanceManagementAuditEvents,
  upsertLamLeaveBlackoutPeriodInputSchema,
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
  lamLeaveBlackoutPeriodSchema,
  lamWriteContextSchema,
} from "../schema.ts";

const toFailure = (error: unknown): LamMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected leave blackout period mutation failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error(
      "Company context is required for leave blackout period mutations"
    );
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error(
      "Input companyId does not match leave and attendance context"
    );
  }

  return args.contextCompanyId;
};

const assertBlackoutDateRange = (startDate: Date, endDate: Date): void => {
  if (endDate.getTime() < startDate.getTime()) {
    throw new Error("endDate must be on or after startDate");
  }
};

const normalizeBlackoutScope = (
  scope: UpsertLamLeaveBlackoutPeriodInput["scope"]
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

const findDuplicateBlackoutCode = (
  periods: readonly { code: string; companyId?: string | null; id: string }[],
  args: { code: string; companyId: string; id: string }
): boolean =>
  periods.some(
    (entry) =>
      entry.id !== args.id &&
      entry.companyId === args.companyId &&
      entry.code.toLowerCase() === args.code.toLowerCase()
  );

export async function upsertLamLeaveBlackoutPeriod(
  input: UpsertLamLeaveBlackoutPeriodInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireLamLeaveEntitlementsWriteAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = upsertLamLeaveBlackoutPeriodInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    assertBlackoutDateRange(validInput.startDate, validInput.endDate);

    const isUpdate = Boolean(validInput.id);
    const parsed = lamLeaveBlackoutPeriodSchema.parse({
      id: validInput.id ?? createLamRecordId(),
      companyId,
      leaveTypeId: validInput.leaveTypeId ?? null,
      code: validInput.code.trim(),
      title: validInput.title.trim(),
      scope: normalizeBlackoutScope(validInput.scope),
      startDate: validInput.startDate,
      endDate: validInput.endDate,
      reason: validInput.reason.trim(),
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
        findDuplicateBlackoutCode(draft.leaveBlackoutPeriods, {
          code: parsed.code,
          companyId,
          id: parsed.id,
        })
      ) {
        throw new Error(`Blackout period code "${parsed.code}" already exists`);
      }

      const before = draft.leaveBlackoutPeriods.find(
        (entry) => entry.id === parsed.id
      );
      const next = lamLeaveBlackoutPeriodSchema.parse({
        ...parsed,
        createdAt: before?.createdAt ?? parsed.createdAt,
      });
      draft.leaveBlackoutPeriods = upsertLamEntity(
        draft.leaveBlackoutPeriods,
        next
      );
      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: normalizeLamMutationActorId(context),
          action: isUpdate
            ? leaveAttendanceManagementAuditEvents.leaveBlackoutPeriodUpdated
            : leaveAttendanceManagementAuditEvents.leaveBlackoutPeriodUpserted,
          entityType: "leave_blackout_period",
          entityId: next.id,
          summary: next.title,
          metadata: buildLamAuditMetadata({
            code: next.code,
            leaveTypeId: next.leaveTypeId,
            startDate: next.startDate.toISOString(),
            endDate: next.endDate.toISOString(),
            active: next.active,
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
