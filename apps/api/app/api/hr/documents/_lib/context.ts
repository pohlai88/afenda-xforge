import type {
  DocumentsManagementPolicyContext,
  ListDocumentsManagementQuery,
} from "@repo/features-employee-management-documents-management";
import { listDocumentsManagementQuerySchema } from "@repo/features-employee-management-documents-management";
import { resolveHrTenantScopedAccess } from "../../_lib/access.ts";

export type DocumentsManagementApiReadContext =
  DocumentsManagementPolicyContext;

export type DocumentsManagementApiWriteContext =
  DocumentsManagementPolicyContext;

export const createDocumentsManagementReadContext = async (
  _request: Request
): Promise<DocumentsManagementApiReadContext> => {
  const { access, capabilities, companyId } =
    await resolveHrTenantScopedAccess();

  return {
    actorId: access.actorId,
    canAdminRetention: capabilities.canWrite,
    canDownload: capabilities.canDownload,
    canRead: capabilities.canRead,
    canReadAudit: capabilities.canRead,
    canSelfAcknowledge: capabilities.canWrite,
    canViewSensitive: capabilities.canViewSensitive,
    companyId,
    requestId: access.requestId,
    tenantId: access.tenantId,
    userId: access.actorId,
  };
};

export const createDocumentsManagementWriteContext = async (
  request: Request
): Promise<DocumentsManagementApiWriteContext> => {
  const { access, capabilities, companyId } =
    await resolveHrTenantScopedAccess();
  const readContext = await createDocumentsManagementReadContext(request);

  return {
    ...readContext,
    actorId: access.actorId,
    canWrite: capabilities.canWrite,
    companyId,
    requestId: access.requestId,
    tenantId: access.tenantId,
    userId: access.actorId,
  };
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
