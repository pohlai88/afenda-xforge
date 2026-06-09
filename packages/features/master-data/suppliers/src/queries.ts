import "server-only";

import type { ListSuppliersQuery, SupplierList } from "./contract.ts";

export const listSuppliers = (query: ListSuppliersQuery): SupplierList => ({
  items: [],
  page: query.page,
  pageSize: query.pageSize,
  total: 0,
});
