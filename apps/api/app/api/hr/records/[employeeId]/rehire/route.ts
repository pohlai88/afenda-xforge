import { hrRecordsRehireEmployeeSchema } from "@repo/features-employee-management-employee-records-management";
import { rehireHrEmployeeRecord } from "@repo/features-employee-management-employee-records-management/server";
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

  const parsed = hrRecordsRehireEmployeeSchema.parse({
    ...(body as Record<string, unknown>),
    priorEmployeeId: employeeId,
  });
  const result = await rehireHrEmployeeRecord(
    parsed,
    await createHrRecordsWriteContext(request)
  );

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
