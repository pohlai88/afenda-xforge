import type {
  DocumentsManagementDocumentProjection,
  DocumentsManagementDocumentSummaryProjection,
} from "@repo/features-employee-management-documents-management";
import {
  canReadDocumentsManagement,
  getDocumentsManagementDocument,
  hrTenantDocumentDownloadPath,
  listDocumentsManagementDocumentSummaries,
  recordDocumentsManagementDocumentAccess,
} from "@repo/features-employee-management-documents-management";
import { resolveRuntimeTenantAccess } from "../../../../_runtime-access.ts";
import {
  createDocumentsManagementPolicyContext,
  resolveHrDocumentsRuntimeAccess,
} from "../../../../api/hr/documents/_context.ts";

type LoadState<T> =
  | {
      data: T;
      status: "ready";
    }
  | {
      message: string;
      status: "error";
    }
  | {
      status: "forbidden";
    };

export type HrDocumentsAccess = {
  canDownload: boolean;
  canRead: boolean;
  canViewSensitive: boolean;
  canWrite: boolean;
};

export type HrDocumentsPageData = {
  access: HrDocumentsAccess;
  actorId: string;
  documents: readonly DocumentsManagementDocumentSummaryProjection[];
  grantedPermissions: readonly string[];
  loadedDocumentCount: number;
  tenantId: string;
  tenantRole: string;
  userEmail: string | null;
  verifiedDocumentCount: number;
  expiringSoonDocumentCount: number;
  mandatoryDocumentCount: number;
};

export type HrDocumentDetailData = {
  access: HrDocumentsAccess;
  actorId: string;
  document: DocumentsManagementDocumentProjection;
  downloadPath: string;
  grantedPermissions: readonly string[];
  tenantId: string;
  tenantRole: string;
  userEmail: string | null;
};

const DOCUMENTS_PAGE_SIZE = 50;
const EXPIRING_WINDOW_DAYS = 30;

const countExpiringSoonDocuments = (
  documents: readonly DocumentsManagementDocumentSummaryProjection[]
): number => {
  const expiryWindow = new Date(
    Date.now() + EXPIRING_WINDOW_DAYS * 24 * 60 * 60 * 1000
  );

  return documents.filter((document) => {
    if (!document.expiresAt) {
      return false;
    }

    return document.expiresAt.getTime() <= expiryWindow.getTime();
  }).length;
};

const toErrorState = (error: unknown): LoadState<never> => ({
  message: error instanceof Error ? error.message : "Unable to load documents",
  status: "error",
});

export const loadHrDocumentsPageData = async (): Promise<
  LoadState<HrDocumentsPageData>
> => {
  const access = await resolveRuntimeTenantAccess();
  const runtimeAccess = resolveHrDocumentsRuntimeAccess(access);

  if (!runtimeAccess.canRead) {
    return {
      status: "forbidden",
    };
  }

  try {
    const context = createDocumentsManagementPolicyContext(access);
    const documents = listDocumentsManagementDocumentSummaries(
      {
        page: 1,
        pageSize: DOCUMENTS_PAGE_SIZE,
      },
      context
    );

    if (!canReadDocumentsManagement(context)) {
      return {
        status: "forbidden",
      };
    }

    return {
      data: {
        access: {
          canDownload: runtimeAccess.canDownload,
          canRead: runtimeAccess.canRead,
          canViewSensitive: runtimeAccess.canViewSensitive,
          canWrite: runtimeAccess.canWrite,
        },
        actorId: access.actorId,
        documents,
        expiringSoonDocumentCount: countExpiringSoonDocuments(documents),
        grantedPermissions: access.grantedPermissions,
        loadedDocumentCount: documents.length,
        mandatoryDocumentCount: documents.filter(
          (document) => document.mandatory
        ).length,
        tenantId: access.tenantId,
        tenantRole: access.role,
        userEmail: access.userEmail,
        verifiedDocumentCount: documents.filter(
          (document) => document.status === "verified"
        ).length,
      },
      status: "ready",
    };
  } catch (error) {
    return toErrorState(error);
  }
};

export const loadHrDocumentDetailPageData = async (
  documentId: string
): Promise<LoadState<HrDocumentDetailData>> => {
  const access = await resolveRuntimeTenantAccess();
  const runtimeAccess = resolveHrDocumentsRuntimeAccess(access);

  if (!runtimeAccess.canRead) {
    return {
      status: "forbidden",
    };
  }

  try {
    const context = createDocumentsManagementPolicyContext(access);
    const document = getDocumentsManagementDocument(documentId, context);

    if (!document) {
      return {
        message: "Document not found.",
        status: "error",
      };
    }

    if (context.canViewSensitive) {
      await recordDocumentsManagementDocumentAccess(
        {
          action: "read_sensitive",
          documentId,
        },
        context
      );
    }

    return {
      data: {
        access: {
          canDownload: runtimeAccess.canDownload,
          canRead: runtimeAccess.canRead,
          canViewSensitive: runtimeAccess.canViewSensitive,
          canWrite: runtimeAccess.canWrite,
        },
        actorId: access.actorId,
        document,
        downloadPath: hrTenantDocumentDownloadPath(document.id),
        grantedPermissions: access.grantedPermissions,
        tenantId: access.tenantId,
        tenantRole: access.role,
        userEmail: access.userEmail,
      },
      status: "ready",
    };
  } catch (error) {
    return toErrorState(error);
  }
};
