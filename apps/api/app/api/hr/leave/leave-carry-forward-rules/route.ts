import type { UpsertLamLeaveCarryForwardRuleInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import {
  listLamLeaveCarryForwardRulesRecords,
  upsertLamLeaveCarryForwardRule,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import {
  createLamReadContext,
  createLamWriteContext,
  getQuery,
} from "../_lib/context.ts";
import { mapLamMutationHttpStatus } from "../_lib/mutation-response.ts";

export async function GET(request: Request) {
  const data = await listLamLeaveCarryForwardRulesRecords(
    getQuery(request),
    createLamReadContext(request)
  );

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body) {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  const isUpdate = typeof body.id === "string" && body.id.trim().length > 0;
  const result = await upsertLamLeaveCarryForwardRule(
    body as UpsertLamLeaveCarryForwardRuleInput,
    createLamWriteContext(request)
  );

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus({
      ...result,
      successStatus: isUpdate ? 200 : 201,
    }),
  });
}
