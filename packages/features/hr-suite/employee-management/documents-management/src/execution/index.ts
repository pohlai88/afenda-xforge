import {
  createDocumentsManagement,
  getDocumentsManagement,
  listDocumentsManagement,
  updateDocumentsManagement,
} from "../server.ts";

export type DocumentsManagementExecutionSurface = {
  create: typeof createDocumentsManagement;
  getById: typeof getDocumentsManagement;
  list: typeof listDocumentsManagement;
  update: typeof updateDocumentsManagement;
};

export const documentsManagementExecutionSurface: DocumentsManagementExecutionSurface =
  {
    create: createDocumentsManagement,
    getById: getDocumentsManagement,
    list: listDocumentsManagement,
    update: updateDocumentsManagement,
  };
