import { hrRecordsCreateEmployeeSchema } from "@repo/features-employee-management-employee-records-management";
import { createHrEmployeeRecord } from "@repo/features-employee-management-employee-records-management/server";
import { NextResponse } from "next/server";
import {
  createHrRecordsReadContext,
  createHrRecordsWriteContext,
} from "./_lib/context.ts";
import { listHrEmployeeRecordsForApi } from "./_lib/search.ts";

export async function GET(request: Request): Promise<Response> {
  const records = await listHrEmployeeRecordsForApi(
    request,
    await createHrRecordsReadContext(request)
  );

  return NextResponse.json(records);
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = hrRecordsCreateEmployeeSchema.parse(await request.json());

    const result = await createHrEmployeeRecord(
      body,
      await createHrRecordsWriteContext(request)
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
