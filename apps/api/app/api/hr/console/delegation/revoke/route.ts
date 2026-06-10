import { revokeHrConsoleDelegation } from "@repo/features-hr-suite-hr-console/server";
import { NextResponse } from "next/server";
import { resolveHrConsoleAccessForRequest } from "../../../../_lib/hr-console-context.ts";
import { mapHrConsoleRouteError } from "../../_lib/route-errors.ts";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { operatorAssignments, scope } =
      await resolveHrConsoleAccessForRequest();
    const payload = (await request.json()) as {
      grantId: string;
      reason: string;
    };
    const grant = await revokeHrConsoleDelegation(
      payload,
      scope,
      operatorAssignments
    );

    return NextResponse.json(grant, { status: 200 });
  } catch (error: unknown) {
    const mapped = mapHrConsoleRouteError(
      error,
      "HR console delegation revoke failed"
    );
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}
