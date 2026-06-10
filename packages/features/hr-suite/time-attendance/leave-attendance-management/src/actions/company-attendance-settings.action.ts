import "server-only";

import type {
  LamMutationResult,
  UpsertLamCompanyAttendanceSettingsInput,
} from "../contracts/index.ts";
import {
  leaveAttendanceManagementAuditEvents,
  upsertLamCompanyAttendanceSettingsInputSchema,
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
  loadLamRepository,
  mutateLamRepository,
  upsertLamEntity,
} from "../repository.ts";
import {
  lamCompanyAttendanceSettingsSchema,
  lamWriteContextSchema,
} from "../schema.ts";

const toFailure = (error: unknown): LamMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected company attendance settings mutation failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error(
      "Company context is required for company attendance settings mutations"
    );
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error(
      "Input companyId does not match leave and attendance context"
    );
  }

  return args.contextCompanyId;
};

export async function upsertLamCompanyAttendanceSettings(
  input: UpsertLamCompanyAttendanceSettingsInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireLamMutationAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = upsertLamCompanyAttendanceSettingsInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    const scope = {
      companyId,
      tenantId: parsedContext.tenantId,
    };
    const existingState = await loadLamRepository(scope);
    const existing = existingState.companyAttendanceSettings.find(
      (entry) => entry.companyId === companyId
    );
    const parsed = lamCompanyAttendanceSettingsSchema.parse({
      id: existing?.id ?? createLamRecordId(),
      companyId,
      attendanceCorrectionsEnabled: validInput.attendanceCorrectionsEnabled,
      updatedAt: new Date(),
      updatedBy: normalizeLamMutationActorId(context),
    });

    await mutateLamRepository((draft) => {
      draft.companyAttendanceSettings = upsertLamEntity(
        draft.companyAttendanceSettings,
        parsed
      );
      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: normalizeLamMutationActorId(context),
          action:
            leaveAttendanceManagementAuditEvents.companyAttendanceSettingsUpdated,
          entityType: "company_attendance_settings",
          entityId: parsed.id,
          summary: "Company attendance settings updated",
          metadata: buildLamAuditMetadata({
            attendanceCorrectionsEnabled: parsed.attendanceCorrectionsEnabled,
          }),
          before: existing,
          after: parsed,
        })
      );
    }, scope);

    return {
      ok: true,
      targetId: parsed.id,
    };
  } catch (error) {
    return toFailure(error);
  }
}
