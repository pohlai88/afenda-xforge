import "server-only";

import type { CurrencyList, ListCurrenciesQuery } from "./contract.ts";

export const listCurrencies = (query: ListCurrenciesQuery): CurrencyList => ({
  items: [],
  page: query.page,
  pageSize: query.pageSize,
  total: 0,
});
