import { listHrConsoleSections } from "@repo/features-hr-suite-hr-console/server";
import { hrConsoleDomainSchema } from "@repo/features-hr-suite-hr-console/schema";
import { NextResponse } from "next/server";
import { resolveHrConsoleAccessForRequest } from "../../../_lib/hr-console-context.ts";
import { mapHrConsoleRouteError } from "../_lib/route-errors.ts";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { operatorAssignments, scope } =
      await resolveHrConsoleAccessForRequest();
    const url = new URL(request.url);
    const domainParam = url.searchParams.get("domain");
    const parsedDomain = domainParam
      ? hrConsoleDomainSchema.safeParse(domainParam)
      : null;

    if (domainParam && !parsedDomain?.success) {
      return NextResponse.json(
        { error: "Invalid HR console domain filter" },
        { status: 400 }
      );
    }

    const sections = await listHrConsoleSections(
      parsedDomain?.success ? { domain: parsedDomain.data } : {},
      scope,
      operatorAssignments
    );

    return NextResponse.json(sections, { status: 200 });
  } catch (error: unknown) {
    const mapped = mapHrConsoleRouteError(error, "HR console sections failed");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}
