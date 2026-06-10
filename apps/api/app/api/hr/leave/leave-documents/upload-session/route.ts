import type { CreateLamLeaveDocumentUploadSessionInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { createLamLeaveDocumentUploadSession } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamWriteContext } from "../../_lib/context.ts";
import { mapLamMutationHttpStatus } from "../../_lib/mutation-response.ts";
import { parseLamJsonBody } from "../../_lib/parse-json-body.ts";

export async function POST(request: Request) {
  const parsedBody = await parseLamJsonBody(request);
  if (!parsedBody.ok) {
    return NextResponse.json(
      { ok: false, error: parsedBody.error },
      { status: 400 }
    );
  }

  const result = await createLamLeaveDocumentUploadSession(
    parsedBody.body as CreateLamLeaveDocumentUploadSessionInput,
    await createLamWriteContext(request)
  );

  return NextResponse.json(result, {
    status: mapLamMutationHttpStatus({ ...result, successStatus: 201 }),
  });
}
