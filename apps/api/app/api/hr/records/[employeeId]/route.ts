import { getHrEmployeeRecord } from "@repo/features-employee-management-employee-records-management/server";
import { NextResponse } from "next/server";
import { createHrRecordsReadContext } from "../_lib/context.ts";

type RouteParams = {
  params: Promise<{
    employeeId: string;
  }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const { employeeId } = await params;
  const record = getHrEmployeeRecord(employeeId, createHrRecordsReadContext(request));

  if (!record) {
    return NextResponse.json(
      { ok: false, error: "Record not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(record);
}
