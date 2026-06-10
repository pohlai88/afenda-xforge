import {
  listEmployeeUserAccountLinks,
  upsertEmployeeUserAccountLink,
} from "@repo/features-employee-management-employee-records-management/server";
import { upsertEmployeeUserAccountLinkInputSchema } from "@repo/features-employee-management-employee-records-management/contract";
import { NextResponse } from "next/server";
import { createHrEmployeeUserAccountContext } from "../_lib/user-account-context.ts";

export async function GET(request: Request): Promise<Response> {
  try {
    const context = await createHrEmployeeUserAccountContext(request);
    const userId = new URL(request.url).searchParams.get("userId") ?? undefined;
    const employeeId =
      new URL(request.url).searchParams.get("employeeId") ?? undefined;

    const result = await listEmployeeUserAccountLinks(
      {
        ...(employeeId ? { employeeId } : {}),
        ...(userId ? { userId } : {}),
      },
      context
    );

    if (!result.ok) {
      return NextResponse.json(result, { status: result.error.includes("denied") ? 403 : 400 });
    }

    return NextResponse.json(result.links ?? [], { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Employee user account listing failed",
      },
      { status: error instanceof Error && error.message.includes("required") ? 400 : 500 }
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const context = await createHrEmployeeUserAccountContext(request);
    const body = upsertEmployeeUserAccountLinkInputSchema.parse(
      await request.json()
    );
    const result = await upsertEmployeeUserAccountLink(body, context);

    if (!result.ok) {
      const status = result.error.includes("denied")
        ? 403
        : result.error.includes("already linked")
          ? 409
          : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, {
      status: body.active === false ? 200 : 201,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }
}
