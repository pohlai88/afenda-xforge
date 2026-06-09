import {
  hrRecordsAssignmentSchema,
} from "@repo/features-employee-management-employee-records-management";
import {
  listHrEmployeeAssignments,
  recordHrEmployeeAssignment,
} from "@repo/features-employee-management-employee-records-management/server";
import { NextResponse } from "next/server";
import {
  createHrRecordsReadContext,
  createHrRecordsWriteContext,
} from "../../_lib/context.ts";

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
    return undefined;
  }

  if (normalized === "true" || normalized === "1") {
    return true;
  }

  if (normalized === "false" || normalized === "0") {
    return false;
  }

  return undefined;
};

const parseOptionalPositiveInteger = (
  value: string | null
): number | undefined => {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
};

const parseOptionalDate = (value: string | null): Date | undefined => {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
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
  const assignments = listHrEmployeeAssignments(
    {
      employeeId,
      managerEmployeeId: toOptionalString(
        url.searchParams.get("managerEmployeeId")
      ),
      departmentId: toOptionalString(url.searchParams.get("departmentId")),
      workLocationCode: toOptionalString(url.searchParams.get("workLocationCode")),
      current: parseOptionalBoolean(url.searchParams.get("current")),
      asOf: parseOptionalDate(url.searchParams.get("asOf")),
      page: parseOptionalPositiveInteger(url.searchParams.get("page")),
      pageSize: parseOptionalPositiveInteger(url.searchParams.get("pageSize")),
    },
    readContext
  );

  return NextResponse.json(assignments);
}

export async function POST(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  const { employeeId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const parsed = hrRecordsAssignmentSchema.parse({
    ...(body as Record<string, unknown>),
    employeeId,
  });
  const result = recordHrEmployeeAssignment(
    parsed,
    createHrRecordsWriteContext(request)
  );

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
