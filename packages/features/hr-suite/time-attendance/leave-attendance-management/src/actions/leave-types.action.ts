import "server-only";

import type {
  LamMutationResult,
  UpsertLamLeaveTypeInput,
} from "../contracts/index.ts";
import {
  leaveAttendanceManagementAuditEvents,
  upsertLamLeaveTypeInputSchema,
} from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireLamLeaveTypesWriteAccess,
} from "../execution.ts";
import {
  createLamRecordId,
  mutateLamRepository,
  upsertLamEntity,
} from "../repository.ts";
import { lamLeaveTypeSchema, lamWriteContextSchema } from "../schema.ts";
import {
  normalizePolicyGroupId,
  policyGroupIdsMatch,
} from "../shared/leave-type-policy-group.ts";

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
    throw new Error("Company context is required for leave type mutations");
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error(
      "Input companyId does not match leave and attendance context"
    );
  }

  return args.contextCompanyId;
};

const findDuplicateLeaveTypeCode = (
  leaveTypes: readonly {
    code: string;
    companyId?: string | null;
    policyGroupId?: string | null;
    id: string;
  }[],
  args: {
    code: string;
    companyId: string;
    policyGroupId: string | null;
    id: string;
  }
): boolean =>
  leaveTypes.some(
    (entry) =>
      entry.id !== args.id &&
      entry.companyId === args.companyId &&
      entry.code.toLowerCase() === args.code.toLowerCase() &&
      policyGroupIdsMatch(entry.policyGroupId, args.policyGroupId)
  );

export async function upsertLamLeaveType(
  input: UpsertLamLeaveTypeInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireLamLeaveTypesWriteAccess(context);
  if (denied) {
    return denied;
  }

  try {
    const validInput = upsertLamLeaveTypeInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    const isUpdate = Boolean(validInput.id);
    const parsed = lamLeaveTypeSchema.parse({
      id: validInput.id ?? createLamRecordId(),
      companyId,
      code: validInput.code.trim(),
      name: validInput.name.trim(),
      kind: validInput.kind,
      policyGroupId: normalizePolicyGroupId(validInput.policyGroupId),
      active: validInput.active ?? true,
      requiresDocument: validInput.requiresDocument ?? false,
      paid: validInput.paid ?? true,
      minNoticeDays: validInput.minNoticeDays ?? null,
      maxConsecutiveDays: validInput.maxConsecutiveDays ?? null,
      eligibilityTenureMonthsMin: validInput.eligibilityTenureMonthsMin ?? null,
      eligibilityGender: validInput.eligibilityGender ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await mutateLamRepository((draft) => {
      if (
        findDuplicateLeaveTypeCode(draft.leaveTypes, {
          code: parsed.code,
          companyId,
          policyGroupId: parsed.policyGroupId ?? null,
          id: parsed.id,
        })
      ) {
        throw new Error(`Leave type code "${parsed.code}" already exists`);
      }

      const before = draft.leaveTypes.find((entry) => entry.id === parsed.id);
      const next = lamLeaveTypeSchema.parse({
        ...parsed,
        createdAt: before?.createdAt ?? parsed.createdAt,
      });
      draft.leaveTypes = upsertLamEntity(draft.leaveTypes, next);
      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId: next.companyId ?? undefined,
          actorId: normalizeLamMutationActorId(context),
          action: isUpdate
            ? leaveAttendanceManagementAuditEvents.leaveTypeUpdated
            : leaveAttendanceManagementAuditEvents.leaveTypeUpserted,
          entityType: "leave_type",
          entityId: next.id,
          summary: next.name,
          metadata: buildLamAuditMetadata({
            code: next.code,
            kind: next.kind,
            active: next.active,
            policyGroupId: next.policyGroupId,
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
