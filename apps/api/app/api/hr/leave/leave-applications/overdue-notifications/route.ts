import { NextResponse } from "next/server";
import { notifyLamOverdueApprovals } from "../../_lib/notify-lam-events.ts";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await notifyLamOverdueApprovals({ request, body });

  return NextResponse.json(
    {
      ok: true,
      ...result,
    },
    { status: 200 }
  );
}
