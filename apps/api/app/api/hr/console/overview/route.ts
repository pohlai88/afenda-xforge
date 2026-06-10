import { readHrConsoleOverview } from "@repo/features-hr-suite-hr-console/server";
import { NextResponse } from "next/server";
import {
  resolveHrConsoleAccessForRequest,
} from "../../../_lib/hr-console-context.ts";
import { mapHrConsoleRouteError } from "../_lib/route-errors.ts";

export async function GET(): Promise<NextResponse> {
  try {
    const { operatorAssignments, scope } =
      await resolveHrConsoleAccessForRequest();
    const overview = await readHrConsoleOverview(scope, operatorAssignments);

    return NextResponse.json(overview, { status: 200 });
  } catch (error: unknown) {
    const mapped = mapHrConsoleRouteError(error, "HR console overview failed");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}
