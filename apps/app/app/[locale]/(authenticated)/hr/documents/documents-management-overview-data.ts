import type { DocumentsManagementDocumentSummaryProjection } from "@repo/features-employee-management-documents-management";
import { resolveRuntimeTenantAccess } from "../../../../_runtime-access.ts";
import { loadHrDocumentsPageData } from "./_data.ts";

export type DocumentsManagementOverviewPageData = {
  actorId: string;
  documents: readonly DocumentsManagementDocumentSummaryProjection[];
  grantedPermissions: readonly string[];
  tenantId: string;
  tenantRole: string;
  userEmail: string | null;
};

export type DocumentsManagementOverviewLoadState =
  | {
      data: DocumentsManagementOverviewPageData;
      status: "ready";
    }
  | {
      message: string;
      status: "error";
    }
  | {
      status: "forbidden";
    };

export const loadDocumentsManagementOverviewPageData =
  async (): Promise<DocumentsManagementOverviewLoadState> => {
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
