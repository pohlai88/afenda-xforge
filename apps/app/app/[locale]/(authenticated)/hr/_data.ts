import type { DocumentsManagementDocumentSummaryProjection } from "@repo/features-employee-management-documents-management";
import { resolveRuntimeTenantAccess } from "../../../_runtime-access.ts";
import { loadHrDocumentsPageData } from "./documents/_data.ts";

export type HrHubPageData = {
  actorId: string;
  documents: readonly DocumentsManagementDocumentSummaryProjection[];
  grantedPermissions: readonly string[];
  tenantId: string;
  tenantRole: string;
  userEmail: string | null;
};

export const loadHrHubPageData = async (): Promise<HrHubPageData> => {
  const access = await resolveRuntimeTenantAccess();
  const documentsResult = await loadHrDocumentsPageData();
  const documents =
    documentsResult.status === "ready"
      ? documentsResult.data.documents.slice(0, 5)
      : [];

  return {
    actorId: access.actorId,
    documents,
    grantedPermissions: access.grantedPermissions,
    tenantId: access.tenantId,
    tenantRole: access.role,
    userEmail: access.userEmail,
  };
};
