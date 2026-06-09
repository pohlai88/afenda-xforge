import {
  createHrEmployeeRecord,
  listHrEmployeeRecords,
} from "@repo/features-employee-management-employee-records-management/server";
import { hrRecordsCreateEmployeeSchema } from "@repo/features-employee-management-employee-records-management";
import { NextResponse } from "next/server";
import {
  createHrRecordsReadContext,
  createHrRecordsWriteContext,
} from "./_lib/context.ts";

export async function GET(request: Request) {
  const records = listHrEmployeeRecords(
    {},
    createHrRecordsReadContext(request)
  );

  return NextResponse.json(records);
}

export async function POST(request: Request) {
  try {
    const body = hrRecordsCreateEmployeeSchema.parse(await request.json());

    const result = createHrEmployeeRecord(
      body,
      createHrRecordsWriteContext(request)
    );

    return NextResponse.json(result, {
      status: result.ok ? 201 : 400,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }
}
