import { createLamLeaveDocumentUploadSession } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamWriteContext } from "../../_lib/context.ts";
import { mapLamMutationHttpStatus } from "../../_lib/mutation-response.ts";

export async function POST(request: Request) {
  const body = await request.json();

  const result = await createLamLeaveDocumentUploadSession(
    body,
    createLamWriteContext(request)
  );

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus({ ...result, successStatus: 201 }),
  });
}
