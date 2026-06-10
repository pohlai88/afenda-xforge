import {
  grantHrConsoleDelegation,
  listHrConsoleDelegationGrants,
} from "@repo/features-hr-suite-hr-console/server";
import { NextResponse } from "next/server";
import { resolveHrConsoleAccessForRequest } from "../../../_lib/hr-console-context.ts";
import { mapHrConsoleRouteError } from "../_lib/route-errors.ts";

export async function GET(): Promise<NextResponse> {
  try {
    const { operatorAssignments, scope } =
      await resolveHrConsoleAccessForRequest();
    const grants = await listHrConsoleDelegationGrants(
      scope,
      operatorAssignments
    );

    return NextResponse.json(grants, { status: 200 });
  } catch (error: unknown) {
    const mapped = mapHrConsoleRouteError(
      error,
      "HR console delegation listing failed"
    );
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { operatorAssignments, scope } =
      await resolveHrConsoleAccessForRequest();
    const payload = (await request.json()) as {
      capabilities: string[];
      granteeId: string;
      reason: string;
      validFrom?: string;
      validTo?: string;
    };
    const grant = await grantHrConsoleDelegation(
      payload,
      scope,
      operatorAssignments
    );

    return NextResponse.json(grant, { status: 201 });
  } catch (error: unknown) {
    const mapped = mapHrConsoleRouteError(
      error,
      "HR console delegation grant failed"
    );
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}
