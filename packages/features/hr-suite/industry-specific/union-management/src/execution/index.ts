import {
  createUnionManagement,
  getUnionManagement,
  listUnionManagement,
  updateUnionManagement,
} from "../server.ts";

export const unionManagementExecutionSurface = {
  create: createUnionManagement,
  getById: getUnionManagement,
  list: listUnionManagement,
  update: updateUnionManagement,
};
