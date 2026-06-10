import type { RouteLamLeaveApplicationInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { routeLamLeaveApplication } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamWriteContext } from "../../../_lib/context.ts";
import { mapLamMutationHttpStatus } from "../../../_lib/mutation-response.ts";
import { parseLamJsonBody } from "../../../_lib/parse-json-body.ts";

type RouteContext = {
  params: Promise<{ applicationId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { applicationId } = await context.params;
  const parsedBody = await parseLamJsonBody(request);
  if (!parsedBody.ok) {
    return NextResponse.json(
      { ok: false, error: parsedBody.error },
      { status: 400 }
    );
  }

  const result = await routeLamLeaveApplication(
    {
      ...(parsedBody.body as RouteLamLeaveApplicationInput),
      applicationId,
    },
    createLamWriteContext(request)
  );

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus(result),
  });
}
