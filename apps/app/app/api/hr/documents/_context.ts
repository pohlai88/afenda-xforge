import "server-only";

import type {
  DocumentsManagementPolicyContext,
  ListDocumentsManagementQuery,
} from "@repo/features-employee-management-documents-management";
import {
  canReadDocumentsManagement,
  canWriteDocumentsManagement,
  listDocumentsManagementQuerySchema,
} from "@repo/features-employee-management-documents-management";
import { ForbiddenError } from "@repo/errors";
import {
  resolveRuntimeTenantAccess,
  type RuntimeTenantAccess,
} from "../../../_runtime-access.ts";

const HR_DOCUMENT_ROLES = new Set(["admin", "manager", "owner"]);
const HR_DOCUMENT_SENSITIVE_ROLES = new Set(["admin", "owner"]);

export type HrDocumentsRuntimeAccess = {
  canRead: boolean;
  canViewSensitive: boolean;
  canWrite: boolean;
  canDownload: boolean;
};

export const resolveHrDocumentsRuntimeAccess = (
  access: RuntimeTenantAccess
): HrDocumentsRuntimeAccess => ({
  canDownload: HR_DOCUMENT_ROLES.has(access.role),
  canRead: HR_DOCUMENT_ROLES.has(access.role),
  canViewSensitive: HR_DOCUMENT_SENSITIVE_ROLES.has(access.role),
  canWrite: HR_DOCUMENT_ROLES.has(access.role),
});

export const createDocumentsManagementPolicyContext = (
  access: RuntimeTenantAccess
): DocumentsManagementPolicyContext => {
  const runtimeAccess = resolveHrDocumentsRuntimeAccess(access);

  return {
    actorId: access.actorId,
    canDownload: runtimeAccess.canDownload,
    canRead: runtimeAccess.canRead,
    canViewSensitive: runtimeAccess.canViewSensitive,
    canWrite: runtimeAccess.canWrite,
    requestId: access.requestId,
    tenantId: access.tenantId,
    userId: access.actorId,
  };
};

export const requireDocumentsManagementReadContext = async (): Promise<{
  access: RuntimeTenantAccess;
  context: DocumentsManagementPolicyContext;
}> => {
  const access = await resolveRuntimeTenantAccess();
  const context = createDocumentsManagementPolicyContext(access);

  if (!canReadDocumentsManagement(context)) {
    throw new ForbiddenError("Read access denied for documents management");
  }

  return { access, context };
};

export const requireDocumentsManagementWriteContext = async (): Promise<{
  access: RuntimeTenantAccess;
  context: DocumentsManagementPolicyContext;
}> => {
  const { access, context } = await requireDocumentsManagementReadContext();

  if (!canWriteDocumentsManagement(context)) {
    throw new ForbiddenError("Write access denied for documents management");
  }

  return { access, context };
};

const parseBooleanQueryValue = (
  value: string | undefined
): boolean | string | undefined => {
  if (value === undefined) {
    return;
  }

  if (value === "true" || value === "1") {
    return true;
  }

  if (value === "false" || value === "0") {
    return false;
  }

  return value;
};

export const getDocumentsManagementQuery = (
  request: Request
): ListDocumentsManagementQuery => {
  const url = new URL(request.url);
  const rawQuery: Record<string, string | number | boolean | undefined> = {};

  for (const [key, value] of url.searchParams.entries()) {
    if (key === "page" || key === "pageSize") {
      rawQuery[key] = Number(value);
      continue;
    }

    if (
      key === "mandatory" ||
      key === "verified" ||
      key === "requiresAttention"
    ) {
      rawQuery[key] = parseBooleanQueryValue(value);
      continue;
    }

    rawQuery[key] = value;
  }

  return listDocumentsManagementQuerySchema.parse(rawQuery);
};
