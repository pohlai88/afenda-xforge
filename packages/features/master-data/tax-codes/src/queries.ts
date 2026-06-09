import "server-only";

import type { ListTaxCodesQuery, TaxCodeList } from "./contract.ts";

export const listTaxCodes = (query: ListTaxCodesQuery): TaxCodeList => ({
  items: [],
  page: query.page,
  pageSize: query.pageSize,
  total: 0,
});
