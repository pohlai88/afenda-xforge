import "server-only";

import type { ListLocationsQuery, LocationList } from "./contract.ts";

export const listLocations = (query: ListLocationsQuery): LocationList => ({
  items: [],
  page: query.page,
  pageSize: query.pageSize,
  total: 0,
});
