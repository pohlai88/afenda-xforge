import "server-only";

import type { ExportLamLeaveReportInput } from "../contracts/index.ts";
import {
  exportLamLeaveReportInputSchema,
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
import { resolveEmployeeIdsFilter } from "../projector/attendance-summary.ts";
import { listLeaveReportEntries } from "../projector/leave-report.ts";
import { createLamRecordId, mutateLamRepository } from "../repository.ts";
import type {
  LamLeaveReportEntry,
  LamLeaveReportExportBatch,
} from "../schema.ts";
import {
  lamLeaveReportExportBatchSchema,
  lamWriteContextSchema,
} from "../schema.ts";

const toFailure = (
  error: unknown
): Extract<ExportLamLeaveReportResult, { ok: false }> => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected leave report export failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error("Company context is required for leave report export");
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error("Input companyId does not match request company context");
  }

  return args.contextCompanyId;
};

export type ExportLamLeaveReportResult =
  | { ok: false; error: string }
  | {
      ok: true;
      targetId: string;
      batch: LamLeaveReportExportBatch;
      entries: readonly LamLeaveReportEntry[];
    };

export async function exportLamLeaveReport(
  input: ExportLamLeaveReportInput,
  context?: LamMutationContext
): Promise<ExportLamLeaveReportResult> {
  const denied = requireLamReportsExportAccess(context);
  if (denied && !denied.ok) {
    return {
      ok: false,
      error: denied.error ?? "Reports export access denied",
    };
  }

  try {
    const validInput = exportLamLeaveReportInputSchema.parse(input);
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

    let batch!: LamLeaveReportExportBatch;
    let entries: LamLeaveReportEntry[] = [];

    await mutateLamRepository((draft) => {
      const employeeIds = resolveEmployeeIdsFilter({
        employeeId: validInput.employeeId,
        employeeIds: validInput.employeeIds,
      });

      entries = listLeaveReportEntries(draft, {
        companyId,
        employeeId: validInput.employeeId ?? undefined,
        employeeIds,
        leaveTypeId: validInput.leaveTypeId ?? undefined,
        status: validInput.status,
        periodStart: validInput.periodStart,
        periodEnd: validInput.periodEnd,
      });

      if (entries.length === 0) {
        throw new Error(
          "No leave report entries are available for export in the selected period"
        );
      }

      const exportedAt = new Date();
      const exportedBy =
        validInput.exportedBy?.trim() || normalizeLamMutationActorId(context);

      batch = lamLeaveReportExportBatchSchema.parse({
        id: createLamRecordId(),
        companyId,
        periodStart: validInput.periodStart,
        periodEnd: validInput.periodEnd,
        exportedAt,
        exportedBy,
        entryCount: entries.length,
        employeeIds: entries.map((entry) => entry.employeeId),
        leaveTypeId: validInput.leaveTypeId ?? undefined,
        status: validInput.status,
      });

      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: exportedBy,
          action: leaveAttendanceManagementAuditEvents.reportExported,
          entityType: "report_export",
          entityId: batch.id,
          summary: `Exported ${batch.entryCount} leave report entry(ies)`,
          metadata: buildLamAuditMetadata({
            exportBatchId: batch.id,
            reportKind: "leave_report",
            periodStart: batch.periodStart.toISOString(),
            periodEnd: batch.periodEnd.toISOString(),
            entryCount: batch.entryCount,
            employeeIds: batch.employeeIds,
            leaveTypeId: batch.leaveTypeId,
            status: batch.status,
          }),
          before: null,
          after: {
            exportBatchId: batch.id,
            entryCount: batch.entryCount,
            employeeIds: batch.employeeIds,
          },
        })
      );
    }, parsedContext);

    return {
      ok: true,
      targetId: batch.id,
      batch,
      entries,
    };
  } catch (error) {
    return toFailure(error);
  }
}
