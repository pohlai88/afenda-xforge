import { deactivateEmployeeUserAccountLink } from "@repo/features-employee-management-employee-records-management/server";
import { upsertEmployeeUserAccountLinkInputSchema } from "@repo/features-employee-management-employee-records-management/contract";
import { NextResponse } from "next/server";
import { createHrEmployeeUserAccountContext } from "../../_lib/user-account-context.ts";

const deactivateInputSchema = upsertEmployeeUserAccountLinkInputSchema.pick({
  userId: true,
});

export async function POST(request: Request): Promise<Response> {
  try {
    const context = await createHrEmployeeUserAccountContext(request);
    const body = deactivateInputSchema.parse(await request.json());
    const result = await deactivateEmployeeUserAccountLink(body, context);

    if (!result.ok) {
      const status = result.error.includes("denied")
        ? 403
        : result.error.includes("not found")
          ? 404
          : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }
}
