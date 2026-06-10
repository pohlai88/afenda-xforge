import "server-only";

import type {
  LamLeaveDocument,
  ListLamLeaveDocumentsQuery,
} from "../contracts/index.ts";
import { listLamLeaveDocumentsQuerySchema } from "../contracts/index.ts";
import { loadLamRepository } from "../repository.ts";
import type { LamReadContext } from "../schema.ts";
import {
  canAccessLamEmployeeRecord,
  filterByCompany,
  filterByEmployeeDataScope,
  paginate,
  readContext,
} from "./shared.ts";

export async function listLamLeaveDocumentsRecords(
  query: ListLamLeaveDocumentsQuery = {},
  context?: LamReadContext
): Promise<readonly LamLeaveDocument[]> {
  const parsed = listLamLeaveDocumentsQuerySchema.parse(query);
  const ctx = readContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return [];
  }

  return paginate(
    filterByEmployeeDataScope(
      filterByCompany(state.leaveDocuments, ctx.companyId),
      context,
      parsed.employeeId
    )
      .filter((entry) =>
        parsed.status ? entry.status === parsed.status : true
      )
      .filter((entry) =>
        parsed.documentKind ? entry.documentKind === parsed.documentKind : true
      )
      .filter((entry) =>
        parsed.leaveApplicationId
          ? entry.leaveApplicationId === parsed.leaveApplicationId
          : true
      )
      .sort(
        (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
      ),
    parsed.page,
    parsed.pageSize
  );
}

export async function getLamLeaveDocumentById(
  id: string,
  context?: LamReadContext
): Promise<LamLeaveDocument | null> {
  const ctx = readContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return null;
  }

  const document =
    filterByCompany(state.leaveDocuments, ctx.companyId).find(
      (entry) => entry.id === id
    ) ?? null;

  if (!(document && canAccessLamEmployeeRecord(context, document.employeeId))) {
    return null;
  }

  return document;
}

const MEDICAL_LEAVE_DOCUMENT_KINDS = new Set([
  "medical_certificate",
  "panel_clinic_referral",
  "hospitalization_document",
]);

export async function getLamMedicalLeaveReferencesForApplication(
  leaveApplicationId: string,
  context?: LamReadContext
): Promise<readonly LamLeaveDocument[]> {
  const ctx = readContext(context);
  const state = await loadLamRepository(ctx);

  if (!ctx.canRead) {
    return [];
  }

  return filterByEmployeeDataScope(
    filterByCompany(state.leaveDocuments, ctx.companyId).filter(
      (entry) => entry.leaveApplicationId === leaveApplicationId
    ),
    context
  )
    .filter((entry) => MEDICAL_LEAVE_DOCUMENT_KINDS.has(entry.documentKind))
    .sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
    );
}
