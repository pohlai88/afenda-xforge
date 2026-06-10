import { NextResponse } from "next/server";
import { notifyLamOverdueApprovals } from "../../_lib/notify-lam-events.ts";
import { parseLamJsonBody } from "../../_lib/parse-json-body.ts";

export async function POST(request: Request) {
  const parsedBody = await parseLamJsonBody(request);
  if (!parsedBody.ok) {
    return NextResponse.json(
      { ok: false, error: parsedBody.error },
      { status: 400 }
    );
  }

  const result = await notifyLamOverdueApprovals({
    request,
    body: parsedBody.body,
  });

  return NextResponse.json(
    {
      ok: true,
      ...result,
    },
    { status: 200 }
  );
}
