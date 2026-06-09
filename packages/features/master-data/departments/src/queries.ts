import "server-only";

import type { DepartmentList, ListDepartmentsQuery } from "./contract.ts";

export const listDepartments = (
  query: ListDepartmentsQuery
): DepartmentList => ({
  items: [],
  page: query.page,
  pageSize: query.pageSize,
  total: 0,
});
