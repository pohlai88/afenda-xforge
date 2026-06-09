import { parseHrRecordsSearchParams } from "@repo/features-employee-management-employee-records-management";
import {
  listHrEmployeeRecords,
  searchHrEmployeeRecords,
} from "@repo/features-employee-management-employee-records-management/server";
import type { HrRecordsApiReadContext } from "./context.ts";

export const listHrEmployeeRecordsForApi = async (
  request: Request,
  context: HrRecordsApiReadContext
) => {
  const url = new URL(request.url);
  const query = parseHrRecordsSearchParams(
    Object.fromEntries(url.searchParams.entries())
  );

  const searchResults = await searchHrEmployeeRecords(query, context);

  return searchResults ?? listHrEmployeeRecords(query, context);
};
