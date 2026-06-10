import type {
  DocumentsManagementPolicyContext,
  ListDocumentsManagementQuery,
} from "@repo/features-employee-management-documents-management";
import { listDocumentsManagementQuerySchema } from "@repo/features-employee-management-documents-management";

const header = (request: Request, name: string): string | undefined =>
  request.headers.get(name)?.trim() || undefined;

const boolHeader = (request: Request, name: string): boolean | undefined => {
  const value = header(request, name);
  if (!value) {
    return;
  }

  return value === "true" || value === "1";
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

export type DocumentsManagementApiReadContext =
  DocumentsManagementPolicyContext;

export type DocumentsManagementApiWriteContext =
  DocumentsManagementPolicyContext;

export const createDocumentsManagementReadContext = (
  request: Request
): DocumentsManagementApiReadContext => ({
  actorEmployeeId: header(request, "x-actor-employee-id"),
  actorId: header(request, "x-actor-id"),
  canAdminRetention:
    boolHeader(request, "x-can-admin-retention-documents") ?? false,
  canDownload: boolHeader(request, "x-can-download-documents") ?? false,
  canRead: boolHeader(request, "x-can-read-documents") ?? true,
  canReadAudit: boolHeader(request, "x-can-read-document-audit") ?? false,
  canSelfAcknowledge:
    boolHeader(request, "x-can-self-acknowledge-documents") ?? false,
  canViewSensitive:
    boolHeader(request, "x-can-view-sensitive-documents") ?? false,
  companyId: header(request, "x-company-id"),
  organizationId: header(request, "x-organization-id"),
  requestId: header(request, "x-request-id"),
  tenantId: header(request, "x-tenant-id"),
  userId: header(request, "x-user-id"),
});

export const createDocumentsManagementWriteContext = (
  request: Request
): DocumentsManagementApiWriteContext => ({
  actorId: header(request, "x-actor-id"),
  actorEmployeeId: header(request, "x-actor-employee-id"),
  canAdminRetention:
    boolHeader(request, "x-can-admin-retention-documents") ?? false,
  canDownload: boolHeader(request, "x-can-download-documents") ?? false,
  canRead: boolHeader(request, "x-can-read-documents") ?? true,
  canReadAudit: boolHeader(request, "x-can-read-document-audit") ?? false,
  canSelfAcknowledge:
    boolHeader(request, "x-can-self-acknowledge-documents") ?? false,
  canViewSensitive:
    boolHeader(request, "x-can-view-sensitive-documents") ?? false,
  canWrite: boolHeader(request, "x-can-write-documents") ?? false,
  companyId: header(request, "x-company-id"),
  organizationId: header(request, "x-organization-id"),
  requestId: header(request, "x-request-id"),
  tenantId: header(request, "x-tenant-id"),
  userId: header(request, "x-user-id"),
});

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
