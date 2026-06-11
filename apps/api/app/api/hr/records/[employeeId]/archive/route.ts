import { hrRecordsArchiveEmployeeSchema } from "@repo/features-employee-management-employee-records-management";
import { archiveHrEmployeeRecord } from "@repo/features-employee-management-employee-records-management/server";
import { NextResponse } from "next/server";
import { createHrRecordsWriteContext } from "../../_lib/context.ts";

type RouteParams = {
  params: Promise<{
    employeeId: string;
  }>;
};

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

  const parsed = hrRecordsArchiveEmployeeSchema.parse({
    ...(body as Record<string, unknown>),
    employeeId,
  });
  const result = await archiveHrEmployeeRecord(
    parsed,
    await createHrRecordsWriteContext(request)
  );

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
