import { getLamLeaveDocumentById } from "@repo/features-time-attendance-leave-attendance-management/server";

import { NextResponse } from "next/server";

import { createLamReadContext } from "../../_lib/context.ts";

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { documentId } = await context.params;

  const document = await getLamLeaveDocumentById(
    documentId,

    createLamReadContext(request)
  );

  if (!document) {
    return NextResponse.json(
      { error: "Leave document not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(document);
}
