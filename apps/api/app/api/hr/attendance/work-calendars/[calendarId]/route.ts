import { getLamWorkCalendarById } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext } from "../../_lib/context.ts";

export async function GET(
  request: Request,
  context: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await context.params;
  const data = await getLamWorkCalendarById(
    calendarId,
    await createLamReadContext(request)
  );

  if (!data) {
    return NextResponse.json(
      { error: "Work calendar not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
