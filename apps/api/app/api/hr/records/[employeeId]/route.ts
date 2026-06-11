import {
  hrRecordsUpdateEmployeeSchema,
  projectHrEmployeeRecordDetail,
} from "@repo/features-employee-management-employee-records-management";
import {
  getHrEmployeeRecord,
  updateHrEmployeeRecord,
} from "@repo/features-employee-management-employee-records-management/server";
import { NextResponse } from "next/server";
import {
  createHrRecordsReadContext,
  createHrRecordsWriteContext,
} from "../_lib/context.ts";

type RouteParams = {
  params: Promise<{
    employeeId: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  const { employeeId } = await params;
  const readContext = await createHrRecordsReadContext(request);
  const record = getHrEmployeeRecord(employeeId, readContext);

  if (!record) {
    return NextResponse.json(
      { ok: false, error: "Record not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    projectHrEmployeeRecordDetail(record, readContext.canViewSensitive)
  );
}

export async function PATCH(
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

  const parsed = hrRecordsUpdateEmployeeSchema.parse({
    ...(body as Record<string, unknown>),
    employeeId,
  });
  const result = await updateHrEmployeeRecord(
    parsed,
    await createHrRecordsWriteContext(request)
  );

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
