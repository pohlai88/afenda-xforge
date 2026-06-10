import "server-only";

import type { ListLamPayrollReferencesQuery } from "../contracts/index.ts";
import { listLamPayrollReferencesQuerySchema } from "../contracts/index.ts";
import { listPayrollReferences } from "../projector/payroll-references.ts";
import {
  findActiveLeaveTypeForApplication,
  projectApprovedLeavePayrollReference,
  projectUnpaidLeavePayrollReference,
  resolveExportedPayrollReferenceApplicationIds,
} from "../projector/unpaid-leave-payroll-references.ts";
import { loadLamRepository } from "../repository.ts";
import type { LamPayrollReference, LamReadContext } from "../schema.ts";
import {
  canAccessLamEmployeeRecord,
  filterByCompany,
  filterByEmployeeDataScope,
  paginate,
  readPayrollReferencesContext,
} from "./shared.ts";

export async function listLamPayrollReferencesRecords(
  query: ListLamPayrollReferencesQuery = {},
  context?: LamReadContext
): Promise<readonly LamPayrollReference[]> {
  const parsed = listLamPayrollReferencesQuerySchema.parse(query);
  const ctx = readPayrollReferencesContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return [];
  }

  return paginate(
    filterByEmployeeDataScope(
      listPayrollReferences(state, {
        companyId: ctx.companyId,
        employeeId: parsed.employeeId ?? undefined,
        payPeriodStart: parsed.payPeriodStart,
        payPeriodEnd: parsed.payPeriodEnd,
        exportStatus: parsed.exportStatus,
        deductionCategory: parsed.deductionCategory ?? "all",
      }),
      context,
      parsed.employeeId
    ),
    parsed.page,
    parsed.pageSize
  );
}

export async function getLamPayrollReferenceByApplicationId(
  applicationId: string,
  context?: LamReadContext
): Promise<LamPayrollReference | null> {
  const ctx = readPayrollReferencesContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return null;
  }

  const application = filterByCompany(
    state.leaveApplications,
    ctx.companyId
  ).find((entry) => entry.id === applicationId);
  if (!application) {
    return null;
  }

  if (!canAccessLamEmployeeRecord(context, application.employeeId)) {
    return null;
  }

  const leaveType = findActiveLeaveTypeForApplication(
    state,
    application,
    application.companyId ?? ctx.companyId ?? ""
  );
  if (!leaveType) {
    return null;
  }

  const exportedApplicationIds = resolveExportedPayrollReferenceApplicationIds(
    state.auditEvents
  );

  const unpaidReference = projectUnpaidLeavePayrollReference({
    application,
    leaveType,
    exportedApplicationIds,
  });
  if (unpaidReference) {
    return unpaidReference;
  }

  const approvedReference = projectApprovedLeavePayrollReference({
    application,
    leaveType,
    exportedApplicationIds,
  });

  return approvedReference;
}
