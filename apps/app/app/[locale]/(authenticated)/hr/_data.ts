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

export type HrHubLoadState =
  | {
      data: HrHubPageData;
      status: "ready";
    }
  | {
      message: string;
      status: "error";
    }
  | {
      status: "forbidden";
    };

export const loadHrHubPageData = async (): Promise<HrHubLoadState> => {
  const access = await resolveRuntimeTenantAccess();
  const documentsResult = await loadHrDocumentsPageData();

  if (documentsResult.status === "forbidden") {
    return { status: "forbidden" };
  }

  if (documentsResult.status === "error") {
    return {
      message: documentsResult.message,
      status: "error",
    };
  }

  return {
    data: {
      actorId: access.actorId,
      documents: documentsResult.data.documents.slice(0, 5),
      grantedPermissions: access.grantedPermissions,
      tenantId: access.tenantId,
      tenantRole: access.role,
      userEmail: access.userEmail,
    },
    status: "ready",
  };
};
