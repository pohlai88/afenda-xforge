import { systemAdminCustomizationReviewRequestSchema } from "@repo/features-system-admin-control-plane/contract";
import { reviewSystemAdminCustomizationImport } from "@repo/features-system-admin-control-plane/server";
import { NextResponse } from "next/server";
import { requireSystemAdminScope } from "../../_lib/context.ts";

export async function POST(request: Request): Promise<Response> {
  try {
    const scope = await requireSystemAdminScope(request);
    const body = systemAdminCustomizationReviewRequestSchema.parse(
      await request.json()
    );

    return NextResponse.json(
      reviewSystemAdminCustomizationImport(body, scope),
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Customization review failed",
      },
      { status: 400 }
    );
  }
}
