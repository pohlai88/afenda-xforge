import "server-only";

import type {
  LamMutationResult,
  UpsertLamHolidayCalendarInput,
} from "../contracts/index.ts";
import {
  leaveAttendanceManagementAuditEvents,
  upsertLamHolidayCalendarInputSchema,
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
  lamHolidayCalendarSchema,
  lamWriteContextSchema,
} from "../schema.ts";

const toFailure = (error: unknown): LamMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected holiday calendar mutation failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error(
      "Company context is required for holiday calendar mutations"
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

const normalizeHolidayCalendarScope = (
  scope: UpsertLamHolidayCalendarInput["scope"]
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

const findDuplicateHolidayCalendarCode = (
  calendars: readonly { code: string; companyId?: string | null; id: string }[],
  args: { code: string; companyId: string; id: string }
): boolean =>
  calendars.some(
    (entry) =>
      entry.id !== args.id &&
      entry.companyId === args.companyId &&
      entry.code.toLowerCase() === args.code.toLowerCase()
  );

export async function upsertLamHolidayCalendar(
  input: UpsertLamHolidayCalendarInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireLamCalendarsWriteAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = upsertLamHolidayCalendarInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    assertEffectiveDateRange(validInput.effectiveFrom, validInput.effectiveTo);

    const isUpdate = Boolean(validInput.id);
    const normalizedScope = normalizeHolidayCalendarScope(validInput.scope);
    const parsed = lamHolidayCalendarSchema.parse({
      id: validInput.id ?? createLamRecordId(),
      companyId,
      code: validInput.code.trim(),
      title: validInput.title.trim(),
      scope: normalizedScope,
      workCalendarId: validInput.workCalendarId ?? null,
      holidays: validInput.holidays ?? [],
      effectiveFrom: validInput.effectiveFrom,
      effectiveTo: validInput.effectiveTo ?? null,
      active: validInput.active ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await mutateLamRepository((draft) => {
      if (parsed.workCalendarId) {
        const workCalendar = draft.workCalendars.find(
          (entry) =>
            entry.id === parsed.workCalendarId && entry.companyId === companyId
        );
        if (!workCalendar) {
          throw new Error(
            `Work calendar "${parsed.workCalendarId}" was not found for this company`
          );
        }
      }

      if (
        findDuplicateHolidayCalendarCode(draft.holidayCalendars, {
          code: parsed.code,
          companyId,
          id: parsed.id,
        })
      ) {
        throw new Error(
          `Holiday calendar code "${parsed.code}" already exists`
        );
      }

      const before = draft.holidayCalendars.find(
        (entry) => entry.id === parsed.id
      );
      const next = lamHolidayCalendarSchema.parse({
        ...parsed,
        createdAt: before?.createdAt ?? parsed.createdAt,
      });
      draft.holidayCalendars = upsertLamEntity(draft.holidayCalendars, next);
      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId: next.companyId ?? undefined,
          actorId: normalizeLamMutationActorId(context),
          action: isUpdate
            ? leaveAttendanceManagementAuditEvents.holidayCalendarUpdated
            : leaveAttendanceManagementAuditEvents.holidayCalendarCreated,
          entityType: "holiday_calendar",
          entityId: next.id,
          summary: next.title,
          metadata: buildLamAuditMetadata({
            code: next.code,
            workCalendarId: next.workCalendarId,
            holidayCount: next.holidays.length,
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
