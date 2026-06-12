import { hrRecordsCreateEmployeeSchema } from "@repo/features-employee-management-employee-records-management";
import { createHrEmployeeRecord } from "@repo/features-employee-management-employee-records-management/server";
import { NextResponse } from "next/server";
import {
  createHrRecordsReadContext,
  createHrRecordsWriteContext,
} from "./_lib/context.ts";
import {
  ensureHrRecordsReadAccess,
  ensureHrRecordsWriteAccess,
} from "./_lib/http.ts";
import { listHrEmployeeRecordsForApi } from "./_lib/search.ts";

export async function GET(request: Request): Promise<Response> {
  const readContext = await createHrRecordsReadContext(request);
  const denied = ensureHrRecordsReadAccess(readContext);

  if (denied) {
    return denied;
  }

  const records = await listHrEmployeeRecordsForApi(request, readContext);

  return NextResponse.json(records);
}

export async function POST(request: Request): Promise<Response> {
  const writeContext = await createHrRecordsWriteContext(request);
  const denied = ensureHrRecordsWriteAccess(writeContext);

  if (denied) {
    return denied;
  }

  try {
    const body = hrRecordsCreateEmployeeSchema.parse(await request.json());

    const result = await createHrEmployeeRecord(body, writeContext);

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
