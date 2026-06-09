export type DocumentsManagementPermission = {
  function: "read" | "update";
  module: "hr";
  object: "documents";
};

export const documentsManagementReadPermission: DocumentsManagementPermission =
  {
    module: "hr",
    object: "documents",
    function: "read",
  };

export const documentsManagementWritePermission: DocumentsManagementPermission =
  {
    module: "hr",
    object: "documents",
    function: "update",
  };

export const documentsManagementSensitiveReadPermission: DocumentsManagementPermission =
  {
    module: "hr",
    object: "documents",
    function: "read",
  };

export const hrWorkforceDocumentsReadPermission: DocumentsManagementPermission =
  documentsManagementReadPermission;
export const hrWorkforceDocumentsWritePermission: DocumentsManagementPermission =
  documentsManagementWritePermission;
export const hrWorkforceDocumentsSensitiveReadPermission: DocumentsManagementPermission =
  documentsManagementSensitiveReadPermission;
