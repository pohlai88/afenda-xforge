import type { LamRepositoryState } from "../repository.ts";
import type {
  LamLeaveEncashmentPayrollReference,
  LamLeaveEncashmentRequest,
  LamLeaveType,
  LamPayrollReferenceExportBatch,
} from "../schema.ts";
import { lamLeaveEncashmentPayrollReferenceSchema } from "../schema.ts";
import type { ListPayrollReferenceFilters } from "./unpaid-leave-payroll-references.ts";

export const buildLeaveEncashmentSourceReference = (
  request: LamLeaveEncashmentRequest,
  leaveType: LamLeaveType
): string =>
  `lam:leave-encashment:${request.companyId ?? "global"}:${request.id}:${leaveType.code}`;

const isWithinPayPeriod = (
  request: LamLeaveEncashmentRequest,
  payPeriodStart?: Date,
  payPeriodEnd?: Date
): boolean => {
  if (!(payPeriodStart ?? payPeriodEnd)) {
    return true;
  }

  const start = payPeriodStart ?? payPeriodEnd;
  const end = payPeriodEnd ?? payPeriodStart;
  if (!(start && end)) {
    return true;
  }

  return request.payPeriodStart <= end && request.payPeriodEnd >= start;
};

export const resolveExportedPayrollReferenceEncashmentRequestIds = (
  auditEvents: LamRepositoryState["auditEvents"]
): Set<string> => {
  const encashmentRequestIds = new Set<string>();

  for (const event of auditEvents) {
    if (event.action !== "lam.payroll-reference.exported") {
      continue;
    }

    const metadata = event.metadata;
    if (!metadata || typeof metadata !== "object") {
      continue;
    }

    const ids = (metadata as { encashmentRequestIds?: unknown })
      .encashmentRequestIds;
    if (!Array.isArray(ids)) {
      continue;
    }

    for (const id of ids) {
      if (typeof id === "string" && id.trim().length > 0) {
        encashmentRequestIds.add(id);
      }
    }
  }

  return encashmentRequestIds;
};

export const projectLeaveEncashmentPayrollReference = (args: {
  request: LamLeaveEncashmentRequest;
  leaveType: LamLeaveType;
  exportedEncashmentRequestIds: ReadonlySet<string>;
  exportBatch?: LamPayrollReferenceExportBatch | null;
}): LamLeaveEncashmentPayrollReference =>
  lamLeaveEncashmentPayrollReferenceSchema.parse({
    id: args.request.id,
    companyId: args.request.companyId,
    employeeId: args.request.employeeId,
    encashmentRequestId: args.request.id,
    leaveTypeId: args.request.leaveTypeId,
    leaveTypeCode: args.leaveType.code,
    policyId: args.request.policyId,
    policyCode: args.request.policyCode,
    encashmentDays: args.request.encashmentDays,
    encashmentRatePercent: args.request.encashmentRatePercent,
    payPeriodStart: args.request.payPeriodStart,
    payPeriodEnd: args.request.payPeriodEnd,
    processedAt: args.request.processedAt,
    deductionCategory: "leave_encashment",
    sourceReference: buildLeaveEncashmentSourceReference(
      args.request,
      args.leaveType
    ),
    exportBatchId: args.exportBatch?.id,
    exportedAt:
      args.exportBatch?.exportedAt ??
      (args.exportedEncashmentRequestIds.has(args.request.id)
        ? args.request.processedAt
        : undefined),
  });

export const listLeaveEncashmentPayrollReferences = (
  state: LamRepositoryState,
  filters: ListPayrollReferenceFilters = {}
): LamLeaveEncashmentPayrollReference[] => {
  const exportedEncashmentRequestIds =
    resolveExportedPayrollReferenceEncashmentRequestIds(state.auditEvents);
  const references: LamLeaveEncashmentPayrollReference[] = [];

  for (const request of state.leaveEncashmentRequests) {
    if (filters.companyId && request.companyId !== filters.companyId) {
      continue;
    }

    if (filters.employeeId && request.employeeId !== filters.employeeId) {
      continue;
    }

    if (
      !isWithinPayPeriod(
        request,
        filters.payPeriodStart,
        filters.payPeriodEnd
      )
    ) {
      continue;
    }

    const leaveType = state.leaveTypes.find(
      (entry) =>
        entry.id === request.leaveTypeId &&
        entry.companyId === (request.companyId ?? filters.companyId) &&
        entry.active
    );
    if (!leaveType) {
      continue;
    }

    const reference = projectLeaveEncashmentPayrollReference({
      request,
      leaveType,
      exportedEncashmentRequestIds,
    });

    const isExported = Boolean(reference.exportedAt);
    if (filters.exportStatus === "exported" && !isExported) {
      continue;
    }
    if (filters.exportStatus === "pending" && isExported) {
      continue;
    }

    references.push(reference);
  }

  return references;
};
