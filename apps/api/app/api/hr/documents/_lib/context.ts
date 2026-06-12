import type {
  DocumentsManagementPolicyContext,
  ListDocumentsManagementQuery,
} from "@repo/features-employee-management-documents-management";
import { listDocumentsManagementQuerySchema } from "@repo/features-employee-management-documents-management";
import { hasPermission, permissionCatalog } from "@repo/permissions";
import type { RuntimeTenantAccess } from "../../../../_runtime-access.ts";
import { resolveHrTenantScopedAccess } from "../../_lib/access.ts";

export type DocumentsManagementApiReadContext =
  DocumentsManagementPolicyContext;

export type DocumentsManagementApiWriteContext =
  DocumentsManagementPolicyContext;

export type HrDocumentsRuntimeAccess = {
  canDownload: boolean;
  canRead: boolean;
  canViewSensitive: boolean;
  canWrite: boolean;
};

export const resolveHrDocumentsRuntimeAccess = (
  grantedPermissions: readonly string[]
): HrDocumentsRuntimeAccess => ({
  canDownload: hasPermission(
    grantedPermissions,
    permissionCatalog.hrDocuments.download
  ),
  canRead: hasPermission(
    grantedPermissions,
    permissionCatalog.hrDocuments.read
  ),
  canViewSensitive: hasPermission(
    grantedPermissions,
    permissionCatalog.hrDocuments.sensitiveRead
  ),
  canWrite: hasPermission(
    grantedPermissions,
    permissionCatalog.hrDocuments.write
  ),
});

export const createDocumentsManagementPolicyContext = (
  access: RuntimeTenantAccess,
  companyId?: string
): DocumentsManagementPolicyContext => {
  const runtimeAccess = resolveHrDocumentsRuntimeAccess(
    access.grantedPermissions
  );

  return {
    actorId: access.actorId,
    canAdminRetention: hasPermission(
      access.grantedPermissions,
      permissionCatalog.hrDocuments.retentionExecute
    ),
    canDownload: runtimeAccess.canDownload,
    canRead: runtimeAccess.canRead,
    canReadAudit: hasPermission(
      access.grantedPermissions,
      permissionCatalog.hrDocuments.auditRead
    ),
    canSelfAcknowledge: hasPermission(
      access.grantedPermissions,
      permissionCatalog.hrDocuments.acknowledgeSelf
    ),
    canViewSensitive: runtimeAccess.canViewSensitive,
    canWrite: runtimeAccess.canWrite,
    companyId,
    requestId: access.requestId,
    tenantId: access.tenantId,
    userId: access.actorId,
  };
};

export const createDocumentsManagementReadContext = async (
  _request: Request
): Promise<DocumentsManagementApiReadContext> => {
  const { access, companyId } = await resolveHrTenantScopedAccess();

  return createDocumentsManagementPolicyContext(access, companyId);
};

export const createDocumentsManagementWriteContext = async (
  request: Request
): Promise<DocumentsManagementApiWriteContext> => {
  const readContext = await createDocumentsManagementReadContext(request);
  const { access, companyId } = await resolveHrTenantScopedAccess();
  const runtimeAccess = resolveHrDocumentsRuntimeAccess(
    access.grantedPermissions
  );

  return {
    ...readContext,
    actorId: access.actorId,
    canWrite: runtimeAccess.canWrite,
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
