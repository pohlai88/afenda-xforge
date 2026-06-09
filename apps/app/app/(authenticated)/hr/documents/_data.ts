import type {
  DocumentsManagementDocumentProjection,
  DocumentsManagementDocumentSummaryProjection,
  DocumentsManagementPolicyContext,
} from "@repo/features-employee-management-documents-management";
import {
  canReadDocumentsManagement,
  getDocumentsManagementDocument,
  hrTenantDocumentDownloadPath,
  listDocumentsManagementDocumentSummaries,
} from "@repo/features-employee-management-documents-management";
import type { RuntimeTenantAccess } from "../../../_runtime-access.ts";
import { resolveRuntimeTenantAccess } from "../../../_runtime-access.ts";

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
  canRead: boolean;
  canViewSensitive: boolean;
  canWrite: boolean;
};

export type HrDocumentsHeaderSet = Readonly<Record<string, string>>;

export type HrDocumentsPageData = {
  access: HrDocumentsAccess;
  documents: readonly DocumentsManagementDocumentSummaryProjection[];
  headerSet: HrDocumentsHeaderSet;
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
  document: DocumentsManagementDocumentProjection;
  downloadPath: string;
  headerSet: HrDocumentsHeaderSet;
  tenantId: string;
  tenantRole: string;
  userEmail: string | null;
};

const DOCUMENTS_PAGE_SIZE = 50;
const EXPIRING_WINDOW_DAYS = 30;
const HR_DOCUMENT_ROLES = new Set(["admin", "manager", "owner"]);
const HR_DOCUMENT_SENSITIVE_ROLES = new Set(["admin", "owner"]);

const isDocumentsManagementRoleAllowed = (role: string): boolean =>
  HR_DOCUMENT_ROLES.has(role);

const canViewSensitiveDocuments = (role: string): boolean =>
  HR_DOCUMENT_SENSITIVE_ROLES.has(role);

const createDocumentsManagementAccess = (
  access: RuntimeTenantAccess
): HrDocumentsAccess => ({
  canRead: isDocumentsManagementRoleAllowed(access.role),
  canViewSensitive: canViewSensitiveDocuments(access.role),
  canWrite: isDocumentsManagementRoleAllowed(access.role),
});

const createDocumentsManagementPolicyContext = (
  access: RuntimeTenantAccess
): DocumentsManagementPolicyContext => {
  const runtimeAccess = createDocumentsManagementAccess(access);

  return {
    actorId: access.actorId,
    canRead: runtimeAccess.canRead,
    canViewSensitive: runtimeAccess.canViewSensitive,
    canWrite: runtimeAccess.canWrite,
    requestId: access.requestId,
    tenantId: access.tenantId,
  };
};

const createDocumentsManagementHeaderSet = (
  access: RuntimeTenantAccess
): HrDocumentsHeaderSet => {
  const runtimeAccess = createDocumentsManagementAccess(access);

  return {
    "x-actor-id": access.actorId,
    "x-can-read-documents": String(runtimeAccess.canRead),
    "x-can-view-sensitive-documents": String(runtimeAccess.canViewSensitive),
    "x-can-write-documents": String(runtimeAccess.canWrite),
    "x-request-id": access.requestId ?? "",
    "x-tenant-id": access.tenantId,
  };
};

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
  const runtimeAccess = createDocumentsManagementAccess(access);

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
        access: runtimeAccess,
        documents,
        expiringSoonDocumentCount: countExpiringSoonDocuments(documents),
        headerSet: createDocumentsManagementHeaderSet(access),
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
  const runtimeAccess = createDocumentsManagementAccess(access);

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

    return {
      data: {
        access: runtimeAccess,
        document,
        downloadPath: hrTenantDocumentDownloadPath(document.id),
        headerSet: createDocumentsManagementHeaderSet(access),
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
