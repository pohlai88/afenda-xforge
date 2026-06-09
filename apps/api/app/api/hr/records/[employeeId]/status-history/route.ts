import { hrRecordsEmploymentStatusSchema } from "@repo/features-employee-management-employee-records-management";
import { listHrEmployeeStatusHistory } from "@repo/features-employee-management-employee-records-management/server";
import { NextResponse } from "next/server";
import { createHrRecordsReadContext } from "../../_lib/context.ts";

type RouteParams = {
  params: Promise<{
    employeeId: string;
  }>;
};

const toOptionalString = (value: string | null): string | undefined =>
  value?.trim() || undefined;

const parseOptionalBoolean = (value: string | null): boolean | undefined => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) {
    return;
  }

  if (normalized === "true" || normalized === "1") {
    return true;
  }

  if (normalized === "false" || normalized === "0") {
    return false;
  }

  return;
};

const parseOptionalPositiveInteger = (
  value: string | null
): number | undefined => {
  if (!value?.trim()) {
    return;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return;
  }

  return parsed;
};

const parseOptionalDate = (value: string | null): Date | undefined => {
  if (!value?.trim()) {
    return;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return;
  }

  return parsed;
};

export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  const { employeeId } = await params;
  const url = new URL(request.url);
  const readContext = createHrRecordsReadContext(request);
  const statusRaw = toOptionalString(url.searchParams.get("status"));
  const status =
    statusRaw && hrRecordsEmploymentStatusSchema.safeParse(statusRaw).success
      ? statusRaw
      : undefined;

  const history = listHrEmployeeStatusHistory(
    {
      employeeId,
      status,
      source: toOptionalString(url.searchParams.get("source")),
      search: toOptionalString(url.searchParams.get("statusHistorySearch")),
      current: parseOptionalBoolean(url.searchParams.get("current")),
      asOf: parseOptionalDate(url.searchParams.get("asOf")),
      page: parseOptionalPositiveInteger(url.searchParams.get("page")),
      pageSize: parseOptionalPositiveInteger(url.searchParams.get("pageSize")),
    },
    readContext
  );

  return NextResponse.json(history);
}
