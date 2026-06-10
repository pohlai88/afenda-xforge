import "server-only";

import type {
  LamMutationResult,
  UpsertLamWorkCalendarInput,
} from "../contracts/index.ts";
import {
  leaveAttendanceManagementAuditEvents,
  upsertLamWorkCalendarInputSchema,
} from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireLamCalendarsWriteAccess,
} from "../execution.ts";
import {
  createLamRecordId,
  mutateLamRepository,
  upsertLamEntity,
} from "../repository.ts";
import {
  lamEntitlementRuleScopeSchema,
  lamWorkCalendarSchema,
  lamWriteContextSchema,
} from "../schema.ts";

const toFailure = (error: unknown): LamMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected work calendar mutation failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error("Company context is required for work calendar mutations");
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

const normalizeWorkCalendarScope = (
  scope: UpsertLamWorkCalendarInput["scope"]
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

const findDuplicateWorkCalendarCode = (
  calendars: readonly { code: string; companyId?: string | null; id: string }[],
  args: { code: string; companyId: string; id: string }
): boolean =>
  calendars.some(
    (entry) =>
      entry.id !== args.id &&
      entry.companyId === args.companyId &&
      entry.code.toLowerCase() === args.code.toLowerCase()
  );

export async function upsertLamWorkCalendar(
  input: UpsertLamWorkCalendarInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireLamCalendarsWriteAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = upsertLamWorkCalendarInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    assertEffectiveDateRange(validInput.effectiveFrom, validInput.effectiveTo);

    const isUpdate = Boolean(validInput.id);
    const normalizedScope = normalizeWorkCalendarScope(validInput.scope);
    const parsed = lamWorkCalendarSchema.parse({
      id: validInput.id ?? createLamRecordId(),
      companyId,
      code: validInput.code.trim(),
      title: validInput.title.trim(),
      scope: normalizedScope,
      weekdayRules: validInput.weekdayRules,
      effectiveFrom: validInput.effectiveFrom,
      effectiveTo: validInput.effectiveTo ?? null,
      active: validInput.active ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await mutateLamRepository((draft) => {
      if (
        findDuplicateWorkCalendarCode(draft.workCalendars, {
          code: parsed.code,
          companyId,
          id: parsed.id,
        })
      ) {
        throw new Error(`Work calendar code "${parsed.code}" already exists`);
      }

      const before = draft.workCalendars.find(
        (entry) => entry.id === parsed.id
      );
      const next = lamWorkCalendarSchema.parse({
        ...parsed,
        createdAt: before?.createdAt ?? parsed.createdAt,
      });
      draft.workCalendars = upsertLamEntity(draft.workCalendars, next);
      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId: next.companyId ?? undefined,
          actorId: normalizeLamMutationActorId(context),
          action: isUpdate
            ? leaveAttendanceManagementAuditEvents.workCalendarUpdated
            : leaveAttendanceManagementAuditEvents.workCalendarCreated,
          entityType: "work_calendar",
          entityId: next.id,
          summary: next.title,
          metadata: buildLamAuditMetadata({
            code: next.code,
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
