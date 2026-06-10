export type DocumentsManagementPermission = {
  function:
    | "read"
    | "sensitive.read"
    | "download"
    | "write"
    | "audit.read"
    | "retention.execute"
    | "acknowledge.self";
  module: "hr";
  object: "documents";
};

export const documentsManagementReadPermission: DocumentsManagementPermission =
  {
    function: "read",
    module: "hr",
    object: "documents",
  };

export const documentsManagementSensitiveReadPermission: DocumentsManagementPermission =
  {
    function: "sensitive.read",
    module: "hr",
    object: "documents",
  };

export const documentsManagementDownloadPermission: DocumentsManagementPermission =
  {
    function: "download",
    module: "hr",
    object: "documents",
  };

export const documentsManagementWritePermission: DocumentsManagementPermission =
  {
    function: "write",
    module: "hr",
    object: "documents",
  };

export const documentsManagementAuditReadPermission: DocumentsManagementPermission =
  {
    function: "audit.read",
    module: "hr",
    object: "documents",
  };

export const documentsManagementRetentionExecutePermission: DocumentsManagementPermission =
  {
    function: "retention.execute",
    module: "hr",
    object: "documents",
  };

export const documentsManagementSelfAcknowledgePermission: DocumentsManagementPermission =
  {
    function: "acknowledge.self",
    module: "hr",
    object: "documents",
  };

export const hrWorkforceDocumentsAuditReadPermission: DocumentsManagementPermission =
  documentsManagementAuditReadPermission;
export const hrWorkforceDocumentsDownloadPermission: DocumentsManagementPermission =
  documentsManagementDownloadPermission;
export const hrWorkforceDocumentsReadPermission: DocumentsManagementPermission =
  documentsManagementReadPermission;
export const hrWorkforceDocumentsRetentionExecutePermission: DocumentsManagementPermission =
  documentsManagementRetentionExecutePermission;
export const hrWorkforceDocumentsSensitiveReadPermission: DocumentsManagementPermission =
  documentsManagementSensitiveReadPermission;
export const hrWorkforceDocumentsWritePermission: DocumentsManagementPermission =
  documentsManagementWritePermission;
export const hrWorkforceDocumentsSelfAcknowledgePermission: DocumentsManagementPermission =
  documentsManagementSelfAcknowledgePermission;
