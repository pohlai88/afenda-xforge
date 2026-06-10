import "server-only";

import type { ExportLamAttendanceSummaryInput } from "../contracts/index.ts";
import {
  exportLamAttendanceSummaryInputSchema,
  leaveAttendanceManagementAuditEvents,
} from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireLamEmployeeMutationScope,
  requireLamReportsExportAccess,
} from "../execution.ts";
import {
  listAttendanceSummaries,
  resolveEmployeeIdsFilter,
} from "../projector/attendance-summary.ts";
import { createLamRecordId, mutateLamRepository } from "../repository.ts";
import type {
  LamAttendanceSummary,
  LamAttendanceSummaryExportBatch,
} from "../schema.ts";
import {
  lamAttendanceSummaryExportBatchSchema,
  lamWriteContextSchema,
} from "../schema.ts";

const toFailure = (
  error: unknown
): Extract<ExportLamAttendanceSummaryResult, { ok: false }> => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected attendance summary export failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error(
      "Company context is required for attendance summary export"
    );
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error("Input companyId does not match request company context");
  }

  return args.contextCompanyId;
};

export type ExportLamAttendanceSummaryResult =
  | { ok: false; error: string }
  | {
      ok: true;
      targetId: string;
      batch: LamAttendanceSummaryExportBatch;
      summaries: readonly LamAttendanceSummary[];
    };

export async function exportLamAttendanceSummary(
  input: ExportLamAttendanceSummaryInput,
  context?: LamMutationContext
): Promise<ExportLamAttendanceSummaryResult> {
  const denied = requireLamReportsExportAccess(context);
  if (denied && !denied.ok) {
    return {
      ok: false,
      error: denied.error ?? "Reports export access denied",
    };
  }

  try {
    const validInput = exportLamAttendanceSummaryInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });

    if (validInput.periodEnd.getTime() < validInput.periodStart.getTime()) {
      throw new Error("periodEnd must be on or after periodStart");
    }

    const scopedEmployeeIds = [
      ...(validInput.employeeId ? [validInput.employeeId] : []),
      ...(validInput.employeeIds ?? []),
    ];
    for (const employeeId of scopedEmployeeIds) {
      const scopeDenied = requireLamEmployeeMutationScope(context, employeeId);
      if (scopeDenied && !scopeDenied.ok) {
        return {
          ok: false,
          error: scopeDenied.error ?? "Employee data scope access denied",
        };
      }
    }

    let batch!: LamAttendanceSummaryExportBatch;
    let summaries: LamAttendanceSummary[] = [];

    await mutateLamRepository((draft) => {
      const employeeIds = resolveEmployeeIdsFilter({
        employeeId: validInput.employeeId,
        employeeIds: validInput.employeeIds,
      });

      summaries = listAttendanceSummaries(draft, {
        companyId,
        employeeId: validInput.employeeId ?? undefined,
        employeeIds,
        attendanceStatus: validInput.attendanceStatus,
        leaveTypeId: validInput.leaveTypeId ?? undefined,
        periodStart: validInput.periodStart,
        periodEnd: validInput.periodEnd,
      });

      if (summaries.length === 0) {
        throw new Error(
          "No attendance summaries are available for export in the selected period"
        );
      }

      const exportedAt = new Date();
      const exportedBy =
        validInput.exportedBy?.trim() || normalizeLamMutationActorId(context);

      batch = lamAttendanceSummaryExportBatchSchema.parse({
        id: createLamRecordId(),
        companyId,
        periodStart: validInput.periodStart,
        periodEnd: validInput.periodEnd,
        exportedAt,
        exportedBy,
        summaryCount: summaries.length,
        employeeIds: summaries.map((summary) => summary.employeeId),
        attendanceStatus: validInput.attendanceStatus,
        leaveTypeId: validInput.leaveTypeId ?? undefined,
      });

      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: exportedBy,
          action: leaveAttendanceManagementAuditEvents.reportExported,
          entityType: "report_export",
          entityId: batch.id,
          summary: `Exported ${batch.summaryCount} attendance summary record(s)`,
          metadata: buildLamAuditMetadata({
            exportBatchId: batch.id,
            reportKind: "attendance_summary",
            periodStart: batch.periodStart.toISOString(),
            periodEnd: batch.periodEnd.toISOString(),
            summaryCount: batch.summaryCount,
            employeeIds: batch.employeeIds,
            attendanceStatus: batch.attendanceStatus,
            leaveTypeId: batch.leaveTypeId,
          }),
          before: null,
          after: {
            exportBatchId: batch.id,
            summaryCount: batch.summaryCount,
            employeeIds: batch.employeeIds,
          },
        })
      );
    }, parsedContext);

    return {
      ok: true,
      targetId: batch.id,
      batch,
      summaries,
    };
  } catch (error) {
    return toFailure(error);
  }
}
