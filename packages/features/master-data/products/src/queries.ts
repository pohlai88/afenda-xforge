import "server-only";

import type { ListProductsQuery, ProductList } from "./contract.ts";

export const listProducts = (query: ListProductsQuery): ProductList => ({
  items: [],
  page: query.page,
  pageSize: query.pageSize,
  total: 0,
});
