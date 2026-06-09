import { hrRecordsCreateEmployeeSchema } from "@repo/features-employee-management-employee-records-management";
import {
  createHrEmployeeRecord,
  listHrEmployeeRecords,
} from "@repo/features-employee-management-employee-records-management/server";
import { NextResponse } from "next/server";
import {
  createHrRecordsReadContext,
  createHrRecordsWriteContext,
} from "./_lib/context.ts";
import { parseHrRecordsSearchParams } from "@repo/features-employee-management-employee-records-management";

export function GET(request: Request): Response {
  const url = new URL(request.url);
  const records = listHrEmployeeRecords(
    parseHrRecordsSearchParams(Object.fromEntries(url.searchParams.entries())),
    createHrRecordsReadContext(request)
  );

  return NextResponse.json(records);
}

export async function POST(request: Request): Promise<Response> {
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
