import "server-only";

import type { ExportLamPayrollReferencesInput } from "../contracts/index.ts";
import {
  exportLamPayrollReferencesInputSchema,
  leaveAttendanceManagementAuditEvents,
} from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireLamEmployeeMutationScope,
  requireLamPayrollReferencesExportAccess,
} from "../execution.ts";
import {
  collectPayrollReferenceExportIds,
  DEFAULT_PAYROLL_EXPORT_CATEGORIES,
  listPayrollReferences,
} from "../projector/payroll-references.ts";
import { createLamRecordId, mutateLamRepository } from "../repository.ts";
import type {
  LamPayrollReference,
  LamPayrollReferenceExportBatch,
} from "../schema.ts";
import {
  lamPayrollReferenceExportBatchSchema,
  lamWriteContextSchema,
} from "../schema.ts";

const toFailure = (
  error: unknown
): Extract<ExportLamPayrollReferencesResult, { ok: false }> => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected payroll reference export failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error("Company context is required for payroll reference export");
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error("Input companyId does not match request company context");
  }

  return args.contextCompanyId;
};

export type ExportLamPayrollReferencesResult =
  | { ok: false; error: string }
  | {
      ok: true;
      targetId: string;
      batch: LamPayrollReferenceExportBatch;
      references: readonly LamPayrollReference[];
    };

export async function exportLamPayrollReferences(
  input: ExportLamPayrollReferencesInput,
  context?: LamMutationContext
): Promise<ExportLamPayrollReferencesResult> {
  const denied = requireLamPayrollReferencesExportAccess(context);
  if (denied && !denied.ok) {
    return {
      ok: false,
      error: denied.error ?? "Payroll reference export access denied",
    };
  }

  try {
    const validInput = exportLamPayrollReferencesInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });

    if (
      validInput.payPeriodEnd.getTime() < validInput.payPeriodStart.getTime()
    ) {
      throw new Error("payPeriodEnd must be on or after payPeriodStart");
    }

    if (validInput.employeeId) {
      const scopeDenied = requireLamEmployeeMutationScope(
        context,
        validInput.employeeId
      );
      if (scopeDenied && !scopeDenied.ok) {
        return {
          ok: false,
          error: scopeDenied.error ?? "Employee data scope access denied",
        };
      }
    }

    const deductionCategories = validInput.deductionCategories ?? [
      ...DEFAULT_PAYROLL_EXPORT_CATEGORIES,
    ];

    let batch!: LamPayrollReferenceExportBatch;
    let references: LamPayrollReference[] = [];

    await mutateLamRepository((draft) => {
      references = listPayrollReferences(draft, {
        companyId,
        employeeId: validInput.employeeId ?? undefined,
        payPeriodStart: validInput.payPeriodStart,
        payPeriodEnd: validInput.payPeriodEnd,
        exportStatus: validInput.includeAlreadyExported ? "all" : "pending",
        deductionCategory: "all",
      }).filter((reference) =>
        deductionCategories.includes(reference.deductionCategory)
      );

      if (references.length === 0) {
        throw new Error(
          "No payroll references are available for export in the selected period"
        );
      }

      const exportedAt = new Date();
      const exportedBy =
        validInput.exportedBy?.trim() || normalizeLamMutationActorId(context);
      const exportIds = collectPayrollReferenceExportIds(references);

      batch = lamPayrollReferenceExportBatchSchema.parse({
        id: createLamRecordId(),
        companyId,
        payPeriodStart: validInput.payPeriodStart,
        payPeriodEnd: validInput.payPeriodEnd,
        exportedAt,
        exportedBy,
        referenceCount: references.length,
        referenceIds: exportIds.referenceIds,
        leaveApplicationIds: exportIds.leaveApplicationIds,
        attendanceRecordIds: exportIds.attendanceRecordIds,
        deductionCategories,
      });

      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: exportedBy,
          action: leaveAttendanceManagementAuditEvents.payrollReferenceExported,
          entityType: "report_export",
          entityId: batch.id,
          summary: `Exported ${batch.referenceCount} payroll reference(s) [${deductionCategories.join(", ")}]`,
          metadata: buildLamAuditMetadata({
            exportBatchId: batch.id,
            payPeriodStart: batch.payPeriodStart.toISOString(),
            payPeriodEnd: batch.payPeriodEnd.toISOString(),
            referenceCount: batch.referenceCount,
            referenceIds: batch.referenceIds,
            leaveApplicationIds: batch.leaveApplicationIds,
            attendanceRecordIds: batch.attendanceRecordIds,
            deductionCategories: batch.deductionCategories,
            employeeId: validInput.employeeId,
          }),
          before: null,
          after: {
            exportBatchId: batch.id,
            referenceCount: batch.referenceCount,
            leaveApplicationIds: batch.leaveApplicationIds,
            attendanceRecordIds: batch.attendanceRecordIds,
            deductionCategories: batch.deductionCategories,
          },
        })
      );
    }, parsedContext);

    return {
      ok: true,
      targetId: batch.id,
      batch,
      references: references.map((reference) => ({
        ...reference,
        exportBatchId: batch.id,
        exportedAt: batch.exportedAt,
      })),
    };
  } catch (error) {
    return toFailure(error);
  }
}
